import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, access, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { parseHTML } from 'linkedom'
import { pages } from '../site/catalog.mjs'
import { verifyHeaderReadiness } from './header-readiness-check.mjs'
import legacyAnchors from '../site/legacy-anchors.json' with { type: 'json' }

const root = resolve(import.meta.dirname, '..')
const output = resolve(root, 'site/out')
const artifacts = resolve(root, 'artifacts/site')
await mkdir(artifacts, { recursive: true })
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.png': 'image/png', '.webp': 'image/webp', '.md': 'text/markdown' }
const fileFor = pathname => resolve(output, '.' + (pathname === '/' ? '/index.html' : extname(pathname) ? pathname : pathname + '.html'))

// Every published document and internal destination must exist in the static artifact.
for (const entry of pages) {
  const html = await readFile(fileFor(entry.route), 'utf8')
  const { document } = parseHTML(html)
  assert.equal(document.querySelectorAll('h1').length, 1, `${entry.route}: one page title`)
  assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'), `https://design.master.co${entry.route === '/' ? '/' : entry.route}`)
  for (const link of document.querySelectorAll('a[href]')) {
    const value = link.getAttribute('href')
    if (!value.startsWith('/') && !value.startsWith('#')) continue
    const url = new URL(value, `http://localhost${entry.route}`)
    const path = fileFor(url.pathname)
    await access(path).catch(() => { throw new Error(`${entry.route}: missing destination ${value}`) })
    if (url.hash && extname(path) === '.html') {
      const destination = parseHTML(await readFile(path, 'utf8')).document
      assert(destination.getElementById(decodeURIComponent(url.hash.slice(1))), `${entry.route}: missing fragment ${value}`)
    }
  }
}

for (const route of legacyAnchors.routes.filter(route => route.destination)) {
  const document = parseHTML(await readFile(fileFor(new URL(route.destination).pathname), 'utf8')).document
  for (const [alias, target] of Object.entries(route.aliases)) {
    const marker = document.getElementById(alias)
    assert(marker, `Missing compatibility fragment ${alias}`)
    assert(document.getElementById(target), `Missing real section ${target}`)
    let next = marker.nextElementSibling
    while (next?.classList.contains('design-legacy-anchor')) next = next.nextElementSibling
    assert.equal(next?.id, target, `${alias} must immediately precede its equivalent section`)
  }
}

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = fileFor(pathname)
    if (!file.startsWith(output + sep)) { response.writeHead(403); response.end(); return }
    response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
    response.end(await readFile(file))
  } catch { response.writeHead(404); response.end('Not found') }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const errors = []
const results = []
const versions = []
try {
  for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
    if (process.env.SITE_TEST_ENGINE && process.env.SITE_TEST_ENGINE !== engine) continue
    const browser = await launcher.launch()
    versions.push({ engine, version: browser.version() })
    try {
      results.push(...await verifyHeaderReadiness(browser, { origin, engine }))
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' })
        page.on('pageerror', error => errors.push(`${engine}/${theme}: ${error.message}`))
        if (engine === 'chromium' && theme === 'light') {
          await page.goto(origin + '/')
          await page.screenshot({ path: resolve(artifacts, 'overview.png') })
        }
        await page.goto(origin + '/master-ui')
        await page.getByRole('radio', { name: 'Compact', exact: true }).check()
        assert.equal(await page.getByRole('radio', { name: 'Comfortable', exact: true }).isChecked(), false)
        const field = page.getByRole('textbox', { name: 'Project name' })
        await field.fill('Accessible field notes')
        await page.getByRole('button', { name: 'Save changes', exact: true }).click()
        await page.getByRole('status').filter({ hasText: 'Saved “Accessible field notes”' }).waitFor()
        await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))))
        await page.screenshot({ path: resolve(artifacts, `${engine}-${theme}-desktop.png`), fullPage: false })
        await page.goto(origin + '/principles')
        await page.getByRole('button', { name: /Search/i }).first().click()
        const search = page.locator('dialog input').first()
        await search.fill('recovery')
        await page.locator('dialog a[href="/patterns/recovery"]').first().waitFor()
        await search.press('Escape')
        await page.setViewportSize({ width: 320, height: 800 })
        await page.goto(origin + '/foundations/typography')
        const menu = page.getByRole('button', { name: 'Menu', exact: true })
        await menu.click()
        await page.getByRole('dialog', { name: 'Navigation', exact: true }).waitFor()
        await page.keyboard.press('Escape')
        await page.getByRole('dialog', { name: 'Navigation', exact: true }).waitFor({ state: 'hidden' })
        await page.locator('.design-compact-nav summary').click()
        await page.locator('.design-compact-nav a[href="/patterns/forms"]').click()
        await page.waitForURL('**/patterns/forms')
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${theme}: narrow overflow`)
        await page.screenshot({ path: resolve(artifacts, `${engine}-${theme}-mobile.png`), fullPage: false })
        await page.locator('html').evaluate(el => { el.style.fontSize = '200%' })
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${theme}: text resize overflow`)
        if (engine === 'chromium') {
          await page.emulateMedia({ forcedColors: 'active' })
          await page.locator('.design-compact-nav summary').focus()
          assert(await page.locator('.design-compact-nav summary').evaluate(element => getComputedStyle(element).outlineStyle !== 'none'), 'Forced-colors keyboard focus remains visible')
        }
        results.push(`${engine}/${theme}: density, submit, first-click search, menu Escape, narrow navigation, reflow and 200% text`)
        await page.close()
      }
    } finally { await browser.close() }
  }
  assert.deepEqual(errors, [], 'No browser runtime errors')
  const report = { routes: pages.length, versions, results, forcedColors: 'Chromium focus checked', screenReader: 'not tested', screenshots: artifacts }
  await writeFile(resolve(artifacts, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally { await new Promise(resolve => server.close(resolve)) }
