import assert from 'node:assert/strict'
import { resolve } from 'node:path'

// Representative reading/table and interactive-foundation pages supplement the
// existing 320px reflow, 200% text, search and cold-hydration behavioral checks.
export async function verifyVisualMatrix(browser, { origin, engine, artifacts }) {
  const results = []
  for (const width of [390, 768, 1280]) {
    for (const theme of ['light', 'dark']) {
      const name = `${engine}-${width}-${theme}`
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.goto(origin + '/')
        await page.evaluate(() => document.fonts.ready)
        await page.waitForFunction(() => !document.querySelector('.ui-header-search')?.disabled)
        const header = await page.locator('.ui-header').evaluate(element => {
          const rect = node => {
            const r = node.getBoundingClientRect()
            return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
          }
          const visible = node => node.getBoundingClientRect().width > 0 && getComputedStyle(node).visibility !== 'hidden'
          const logo = [...element.querySelectorAll(':scope > .ui-header-brand svg')].filter(visible)
          const parts = [...element.children].filter(node => node.tagName !== 'DIALOG' && visible(node)).map(rect)
          return {
            bounds: rect(element), parts,
            logos: logo.map(svg => ({ ...rect(svg), viewBox: svg.viewBox.baseVal.width / svg.viewBox.baseVal.height, ink: getComputedStyle(svg.querySelector('path:last-child')).fill, gold: Boolean(svg.querySelector('linearGradient stop')) })),
            documentWidth: document.documentElement.scrollWidth,
          }
        })
        assert(header.documentWidth <= width + 1, `${name}: home document overflow`)
        assert.equal(header.logos.length, 1, `${name}: one visible header logo`)
        const logo = header.logos[0]
        assert(Math.abs(logo.height - 20) < 1, `${name}: preserve 20px logo height`)
        assert(Math.abs(logo.width / logo.height - logo.viewBox) < 0.05, `${name}: unstretched logo`)
        assert.equal(logo.ink, theme === 'light' ? 'rgb(21, 21, 23)' : 'rgb(247, 247, 248)', `${name}: neutral logo ink follows theme`)
        assert(logo.gold, `${name}: gold mark retained`)
        for (const part of header.parts) {
          assert(part.x >= -1 && part.right <= width + 1 && part.y >= header.bounds.y - 1 && part.bottom <= header.bounds.bottom + 1, `${name}: header part stays inside header`)
        }
        const ordered = [...header.parts].sort((a, b) => a.x - b.x)
        for (let i = 1; i < ordered.length; i++) assert(ordered[i - 1].right <= ordered[i].x + 1, `${name}: header parts do not overlap`)
        await page.screenshot({ animations: 'disabled', path: resolve(artifacts, `${name}-home.png`) })

        const frame = page.locator('.ui-table').first()
        await frame.scrollIntoViewIfNeeded()
        const table = await frame.evaluate(element => {
          const bounds = element.getBoundingClientRect()
          const table = element.querySelector('table')
          return { x: bounds.x, right: bounds.right, width: bounds.width, scrollWidth: element.scrollWidth, overflow: getComputedStyle(element).overflowX, canonicalFrame: element.matches('.sheet.sheet-flat'), canonicalTable: table?.matches('.table'), headings: table?.querySelectorAll('th').length, documentWidth: document.documentElement.scrollWidth }
        })
        assert(table.canonicalFrame && table.canonicalTable && table.headings > 0, `${name}: semantic table uses canonical frame`)
        assert(table.x >= -1 && table.right <= width + 1 && table.documentWidth <= width + 1, `${name}: table stays within document`)
        if (table.scrollWidth > table.width + 1) assert(['auto', 'scroll'].includes(table.overflow), `${name}: wide table scrolls locally`)
        await frame.screenshot({ animations: 'disabled', path: resolve(artifacts, `${name}-table.png`) })

        await page.goto(origin + '/foundations/sizing')
        await page.evaluate(() => document.fonts.ready)
        await page.getByRole('radio', { name: 'Compact', exact: true }).check()
        const sizingWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        assert(sizingWidth <= width + 1, `${name}: sizing document overflow`)
        await page.locator('.design-specimen').scrollIntoViewIfNeeded()
        await page.screenshot({ animations: 'disabled', path: resolve(artifacts, `${name}-sizing.png`) })
        assert.deepEqual(errors, [], `${name}: no runtime errors`)
        results.push({ name, width, theme, header, table, sizingWidth, screenshots: ['home', 'table', 'sizing'].map(part => `${name}-${part}.png`) })
      } finally { await page.close() }
    }
  }
  return results
}
