import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Exercise a real built shell while its header module is deliberately unavailable. */
export async function verifyHeaderReadiness(browser, { origin, pathname = '/principles', engine = 'browser' }) {
  const results = []
  for (const [mode, width] of [['desktop', 1280], ['mobile', 320]]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: 'reduce' })
    const headerModule = /\/_astro\/DocHeader\.[^/]+\.js$/
    let releaseHeader
    const headerGate = new Promise(resolve => { releaseHeader = resolve })
    await page.route(headerModule, async route => {
      await headerGate
      await route.continue()
    })
    const headerRequest = page.waitForRequest(headerModule)
    const navigation = page.goto(new URL(pathname, origin).href, { waitUntil: 'domcontentloaded' })
    try {
      await headerRequest
      const search = page.getByRole('button', { name: /Search/i }).first()
      const menu = page.getByRole('button', { name: 'Menu', exact: true })
      await search.waitFor({ state: 'visible' })
      assert(await search.isDisabled(), `${engine}/${mode}: SSR search must wait for its event handler`)
      if (mode === 'mobile') assert(await menu.isDisabled(), `${engine}/${mode}: SSR menu must wait for its dialog behavior`)
      releaseHeader()
      await navigation
      if (mode === 'desktop') {
        await search.click()
        const input = page.locator('dialog input').first()
        await input.waitFor()
        await input.press('Escape')
      } else {
        await menu.click()
        await page.getByRole('dialog', { name: 'Navigation', exact: true }).waitFor()
        await page.keyboard.press('Escape')
        await page.getByRole('dialog', { name: 'Navigation', exact: true }).waitFor({ state: 'hidden' })
      }
      results.push(`${engine}/${mode}: held header module disables SSR controls; first mounted activation works`)
    } finally {
      releaseHeader()
      await navigation.catch(() => {})
      await page.close()
    }
  }
  return results
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.env.HEADER_TEST_ORIGIN, 'Set HEADER_TEST_ORIGIN to the built or hosted site origin')
  const { chromium, webkit } = await import('@playwright/test')
  const results = []
  for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
    if (process.env.HEADER_TEST_ENGINE && process.env.HEADER_TEST_ENGINE !== engine) continue
    const browser = await launcher.launch()
    try { results.push(...await verifyHeaderReadiness(browser, { origin: process.env.HEADER_TEST_ORIGIN, pathname: process.env.HEADER_TEST_ROUTE || '/principles', engine })) }
    finally { await browser.close() }
  }
  console.log(JSON.stringify(results, null, 2))
}
