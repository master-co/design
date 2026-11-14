import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect } from '@playwright/test'
import { pages } from '../site/catalog.mjs'
import { figures, figuresFor } from '../site/figures/catalog.mjs'

export async function verifyTeachingReadiness(browser, { origin, engine }) {
  const checks = []
  for (const [path, component, selector] of [
    ['/foundations/color', 'DesignLab', '[data-lab="color"]'],
    ['/studies/service', 'TaskStudy', '[data-study="service"]'],
    ['/studies/workspace', 'TaskStudy', '[data-study="workspace"]'],
  ]) {
    const page = await browser.newPage()
    const module = new RegExp(`/_astro/${component}\\.[^/]+\\.js$`)
    let release
    const gate = new Promise(resolve => { release = resolve })
    await page.route(module, async route => { await gate; await route.continue() })
    const requested = page.waitForRequest(module)
    const navigation = page.goto(origin + path, { waitUntil: 'domcontentloaded' })
    try {
      await requested
      const specimen = page.locator(selector)
      await expect(specimen).toBeVisible()
      const controls = specimen.locator('input,select,button')
      assert(await controls.count() > 0)
      for (const control of await controls.all()) assert(await control.isDisabled(), `${engine}/${path}: waiting controls are disabled`)
      release()
      await navigation
      if (component === 'DesignLab') {
        await specimen.getByRole('slider').fill('0')
        await expect(specimen.locator('.study-output')).toContainText('below')
      } else if (path.endsWith('service')) {
        await specimen.getByLabel('Your name').fill('First mounted value')
        await specimen.getByLabel('Email address').fill('maya@example.test')
        await specimen.getByRole('button', { name: 'Review request' }).click()
        await expect(specimen).toContainText('First mounted value')
      } else {
        await specimen.getByLabel('Select all visible active projects', { exact: true }).check()
        await expect(specimen.locator('caption')).toContainText('4 selected')
      }
      checks.push(`${engine}/${path}: readable SSR, disabled waiting controls, first hydrated operation retained`)
    } finally {
      release()
      await navigation.catch(() => {})
      await page.close()
    }
  }
  return checks
}

export async function verifyTeaching(browser, { origin, engine, artifacts }) {
  const directory = resolve(artifacts, 'teaching')
  await mkdir(directory, { recursive: true })
  const checks = [], errors = [], captures = []
  checks.push(...await verifyTeachingReadiness(browser, { origin, engine }))
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(10000)
  const goto = async route => { await page.goto(origin + route); await page.evaluate(() => document.fonts.ready) }
  const lab = name => page.locator(`[data-lab="${name}"]`)
  const study = name => page.locator(`[data-study="${name}"]`)
  const fits = async label => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}: ${label} page overflow`)
  try {
    await goto('/foundations/color')
    await expect(lab('color').getByRole('slider')).toBeEnabled()
    await lab('color').getByRole('slider').fill('1')
    await expect(lab('color').locator('output').last()).toHaveText(/:1/)
    await lab('color').getByLabel('Dark specimen').check()
    await lab('color').getByRole('slider').fill('0')
    await expect(lab('color').locator('.study-output')).toContainText('below')
    await lab('color').getByRole('button', { name: 'Reset experiment' }).click()
    await expect(lab('color').getByLabel('Dark specimen')).not.toBeChecked()
    checks.push('composited pair, failure threshold and reset')

    await goto('/foundations/sizing')
    await lab('density').getByRole('slider', { name: 'Target size' }).fill('56')
    await lab('density').getByRole('slider', { name: 'Between-target gap' }).fill('0')
    const bounds = await lab('density').locator('.lab-targets button').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { x: r.x, width: r.width, height: r.height, right: r.right } }))
    assert(bounds.every(r => Math.abs(r.width - 56) < 1 && Math.abs(r.height - 56) < 1))
    assert(bounds[0].right <= bounds[1].x + .5)
    await lab('density').getByRole('button', { name: 'Next specimen item' }).click()
    await expect(lab('density').locator('.study-output')).toContainText('Activations: 1')
    checks.push('actual target bounds, nonoverlap and activation')

    await goto('/craft/geometry')
    await lab('geometry').getByRole('slider', { name: 'Inset', exact: true }).fill('12')
    await expect(lab('geometry').locator('.study-output')).toContainText('11.5px')
    const geometry = await lab('geometry').locator('.lab-geometry').evaluate(element => ({ radius: getComputedStyle(element).borderRadius, padding: getComputedStyle(element).padding, child: getComputedStyle(element.firstElementChild).borderRadius }))
    assert.deepEqual(geometry, { radius: '24px', padding: '12px', child: '12px' })
    checks.push('circular inset calculation agrees with rendered CSS')

    await goto('/foundations/typography')
    await lab('typography').getByLabel('Sample language').selectOption('zh-Hant')
    await lab('typography').getByLabel('Longer content').check()
    await expect(lab('typography').locator('.lab-type')).toHaveAttribute('lang', 'zh-Hant')
    await lab('typography').getByLabel('Sample language').selectOption('ar')
    await expect(lab('typography').locator('.lab-type')).toHaveAttribute('dir', 'rtl')
    checks.push('long mixed-script and RTL typography')

    await goto('/craft/states')
    const selectedButton = lab('states').getByRole('button', { name: /Field notes/ })
    await selectedButton.focus()
    await page.keyboard.press('Space')
    await expect(selectedButton).toHaveAttribute('aria-pressed', 'false')
    await expect(selectedButton).toBeFocused()
    if (engine === 'chromium') {
      await page.emulateMedia({ forcedColors: 'active' })
      assert(await selectedButton.evaluate(element => getComputedStyle(element).outlineStyle !== 'none'))
      await lab('states').screenshot({ path: resolve(directory, `${engine}-focus-forced-colors.png`) })
      await page.emulateMedia({ forcedColors: 'none' })
    }
    checks.push('selection changes without losing independent keyboard focus')

    await goto('/patterns/responsive')
    await lab('responsive').getByLabel('Narrow reading region').check()
    await lab('responsive').getByLabel('Right-to-left composition').check()
    const regions = await lab('responsive').locator('.lab-reading-layout').evaluate(element => [...element.children].map(child => { const r = child.getBoundingClientRect(); return { top: r.top, bottom: r.bottom } }))
    assert(regions[0].bottom <= regions[1].top + .5)
    await lab('responsive').getByRole('link', { name: 'Reading section' }).click()
    checks.push('responsive regions stack and section links retain destinations')

    await goto('/patterns/async')
    await lab('async').getByRole('button', { name: 'Start A', exact: true }).click()
    await lab('async').getByRole('button', { name: 'Start B', exact: true }).click()
    await lab('async').getByRole('button', { name: 'Resolve newest' }).click()
    await lab('async').getByRole('button', { name: 'Resolve oldest' }).click()
    await expect(lab('async').locator('[data-confirmed]')).toHaveText('Draft B')
    await expect(lab('async').getByRole('status')).toContainText('Ignored stale')
    await lab('async').getByRole('button', { name: 'Start A', exact: true }).click()
    await lab('async').getByRole('button', { name: 'Cancel current' }).click()
    await lab('async').getByRole('button', { name: 'Resolve oldest' }).click()
    await expect(lab('async').locator('[data-confirmed]')).toHaveText('Draft B')
    checks.push('out-of-order callbacks and cancellation preserve the confirmed result')

    await goto('/craft/motion')
    await lab('motion').getByRole('button', { name: 'Toggle destination' }).click()
    assert.equal(await lab('motion').locator('.lab-motion-object').evaluate(element => getComputedStyle(element).transitionDuration), '0s')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await lab('motion').getByRole('button', { name: 'Reset experiment' }).click()
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await lab('motion').getByRole('button', { name: 'Reverse mid-flight' }).click()
    await expect(lab('motion').getByRole('status')).toContainText('Destination: Start')
    await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.timeline === document.timeline && animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    checks.push('motion reversal settles at the requested state; system reduced motion removes travel')

    await goto('/studies/reading')
    const reading = study('reading'), search = reading.getByRole('searchbox', { name: 'Search articles' })
    await search.fill('space')
    await search.dispatchEvent('compositionstart')
    await search.press('Enter')
    assert(!new URL(page.url()).searchParams.has('q'), 'IME commit must not submit')
    await search.dispatchEvent('compositionend')
    await reading.getByRole('combobox', { name: 'Category' }).selectOption('Craft')
    await reading.getByRole('button', { name: 'Search collection' }).click()
    assert.equal(new URL(page.url()).searchParams.get('q'), 'space')
    await reading.getByRole('link', { name: 'Space that explains grouping' }).click()
    await expect(reading.locator('h4')).toBeFocused()
    await reading.getByRole('link', { name: 'In practice', exact: true }).click()
    await page.goBack() // Undo the section fragment first.
    await page.goBack() // Return to results.
    await expect(search).toHaveValue('space')
    await expect(reading.getByRole('link', { name: 'Space that explains grouping' })).toBeFocused()
    await search.fill('no such article')
    await reading.getByRole('button', { name: 'Search collection' }).click()
    await expect(reading).toContainText('No matching articles')
    await reading.getByRole('button', { name: 'Clear criteria' }).click()
    await reading.getByLabel('Simulate failure on next search').check()
    await reading.getByRole('button', { name: 'Search collection' }).click()
    await reading.getByRole('button', { name: 'Retry search' }).click()
    await expect(reading.getByRole('status')).toContainText('4 matching')
    await goto('/studies/reading?q=space&category=Craft&article=spacing')
    await expect(study('reading').locator('h4')).toHaveText('Space that explains grouping')
    checks.push('reading: IME, URL criteria, direct load, section link, browser Back, no matches and failed retry')

    await goto('/studies/service')
    const service = study('service')
    await service.getByRole('button', { name: 'Review request' }).click()
    await expect(service.locator('.study-summary')).toBeFocused()
    assert.equal(await service.locator('input[aria-invalid="true"]').count(), 2)
    await service.getByRole('textbox', { name: 'Your name' }).fill('Maya Chen')
    assert.equal(await service.locator('input[aria-invalid="true"]').count(), 1)
    await service.getByRole('textbox', { name: 'Email address' }).fill('maya@example.test')
    await service.getByRole('textbox', { name: 'Email address' }).press('Enter')
    await expect(service.locator('h4')).toHaveText('2. Review your request')
    await service.getByRole('button', { name: 'Change details' }).click()
    await expect(service.getByRole('textbox', { name: 'Your name' })).toHaveValue('Maya Chen')
    await service.getByRole('button', { name: 'Review request' }).click()
    await service.getByRole('button', { name: 'Submit request', exact: true }).click()
    await expect(service.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
    await expect(service.getByRole('status')).toContainText('failure')
    await expect(service).toContainText('maya@example.test')
    await service.getByRole('button', { name: 'Retry submission' }).click()
    await expect(service.locator('h4')).toHaveText('3. Request complete')
    await expect(service.locator('h4')).toBeFocused()
    await service.getByRole('button', { name: 'Start a new request' }).click()
    await service.getByRole('textbox', { name: 'Your name' }).fill('Retained draft')
    await service.getByRole('button', { name: 'Start over' }).click()
    await service.getByRole('button', { name: 'Keep this draft' }).click()
    await expect(service.getByRole('textbox', { name: 'Your name' })).toHaveValue('Retained draft')
    await service.getByRole('button', { name: 'Start over' }).click()
    await service.getByRole('button', { name: 'Discard draft' }).click()
    await expect(service.getByRole('textbox', { name: 'Your name' })).toHaveValue('')
    checks.push('service: multi-error correction, Enter, review/back, duplicate prevention, retained retry, completion and discard choice')

    await goto('/studies/workspace')
    const workspace = study('workspace')
    await workspace.getByRole('checkbox', { name: 'Select Field notes', exact: true }).check()
    assert(await workspace.getByRole('checkbox', { name: 'Select all visible active projects' }).evaluate(element => element.indeterminate))
    await workspace.getByRole('searchbox', { name: 'Find projects' }).fill('Research')
    await expect(workspace.getByRole('status')).toContainText('Selection cleared')
    await workspace.getByRole('searchbox', { name: 'Find projects' }).fill('')
    await workspace.getByRole('button', { name: 'Edit Field notes', exact: true }).click()
    await workspace.getByRole('textbox', { name: 'Project name' }).fill('Discarded name')
    await workspace.getByRole('button', { name: 'Cancel edit' }).click()
    await expect(workspace.getByRole('button', { name: 'Edit Field notes', exact: true })).toBeFocused()
    await workspace.getByRole('button', { name: 'Edit Field notes', exact: true }).click()
    await workspace.getByRole('textbox', { name: 'Project name' }).fill('Updated field notes')
    await workspace.getByRole('button', { name: 'Save project name' }).click()
    await expect(workspace.getByRole('button', { name: 'Edit Updated field notes', exact: true })).toBeFocused()
    await workspace.getByRole('button', { name: /Project ↑/ }).click()
    await workspace.getByRole('checkbox', { name: 'Select all visible active projects' }).check()
    await workspace.getByRole('button', { name: 'Archive 4 selected' }).click()
    await expect(workspace.getByRole('status')).toContainText('3 archived in this operation; 1 failed')
    await workspace.getByRole('button', { name: 'Retry 1 failed' }).click()
    await expect(workspace.getByRole('status')).toContainText('1 archived in this operation; 0 failed')
    await workspace.getByRole('button', { name: 'Undo latest archive' }).click()
    await expect(workspace.locator('tbody tr')).toHaveCount(4)
    checks.push('workspace: mixed selection, scope reset, edit/cancel/save, stable sort, partial batch, scoped retry and durable undo')

    // Every static figure is captured in its article at reading and narrow widths, in both appearances.
    for (const width of [1280, 320]) for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme: theme })
      for (const entry of pages.filter(entry => figuresFor(entry.source).length)) {
        await goto(entry.route)
        await fits(`${entry.route}/${width}/${theme}`)
        if (['/craft/geometry', '/patterns/forms', '/studies/service'].includes(entry.route)) {
          await page.locator('.design-figure,.task-study').first().scrollIntoViewIfNeeded()
          await page.evaluate(() => scrollBy(0, -90))
          await page.screenshot({ path: resolve(directory, `${engine}-${width}-${theme}-${entry.route.split('/').at(-1)}-context.png`) })
        }
        for (const tray of await page.locator('.design-figure,.design-study-frame').all()) {
          await expect(tray).toHaveClass(/\btray ui-tray\b/)
          await expect(tray.locator(':scope > .sheet.sheet-flat.ui-stage')).toHaveCount(1)
          await expect(tray.locator(':scope > .ui-tray-head')).toBeVisible()
          await expect(tray.locator(':scope > .ui-tray-caption')).toBeVisible()
        }
        const illustrated = page.locator('.design-figure')
        assert.equal(await illustrated.count(), figuresFor(entry.source).filter(item => item.component === 'GuideFigure').length)
        for (const element of await illustrated.all()) {
          const id = await element.getAttribute('data-figure')
          const measurement = await element.locator('.df-stage').evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth, text: element.textContent.trim().length }))
          if (measurement.scroll > measurement.width + 1 || !measurement.text) await element.screenshot({ path: resolve(directory, `failure-${engine}-${id}-${width}-${theme}.png`) })
          assert(measurement.scroll <= measurement.width + 1 && measurement.text > 0, `${engine}/${id}/${width}/${theme}: figure content fits ${JSON.stringify(measurement)}`)
          const file = `${engine}-${width}-${theme}-${id}.png`
          await element.screenshot({ path: resolve(directory, file), animations: 'disabled', style: '.ui-header, .design-skip { visibility: hidden; }' })
          captures.push(file)
        }
        for (const element of await page.locator('.design-lab,.task-study').all()) {
          const id = await element.getAttribute('data-lab') || await element.getAttribute('data-study')
          const contentBounds = await element.evaluate(node => {
            const content = node.getBoundingClientRect(), sheet = node.closest('.ui-stage').getBoundingClientRect()
            // UI sliders deliberately bleed 5px into surrounding padding for their thumb/focus paint.
            return { contentRight: content.left + node.scrollWidth, sheetRight: sheet.right }
          })
          assert(contentBounds.contentRight <= contentBounds.sheetRight - 2, `${engine}/${id}/${width}/${theme}: teaching content fits its sheet ${JSON.stringify(contentBounds)}`)
          await element.locator('xpath=ancestor::figure').screenshot({ path: resolve(directory, `${engine}-${width}-${theme}-${id}.png`), animations: 'disabled', style: '.ui-header, .design-skip { visibility: hidden; }' })
        }
      }
      console.log(`${engine}: teaching figures verified at ${width}px in ${theme}`)
    }
    await goto('/foundations/shape')
    const description = page.locator('[data-figure="shape-inset"] summary')
    await description.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-figure="shape-inset"] details')).toHaveAttribute('open', '')
    await expect(page.locator('[data-figure="shape-inset"] details')).toContainText('inner corner has radius 16')
    checks.push('shared Demo tray, sheet stage and captions on every teaching presentation; keyboard text description')
    // Long text, enlarged text and touch use the actual interactive specimens.
    for (const route of ['/foundations/typography', '/patterns/responsive', '/studies/service', '/studies/workspace']) {
      await goto(route)
      await page.locator('html').evaluate(element => element.style.fontSize = '200%')
      await fits(`${route}/200%`)
      await page.locator('.design-lab,.task-study').first().screenshot({ path: resolve(directory, `${engine}-200-${route.split('/').at(-1)}.png`) })
    }
    checks.push('all figures: reading/narrow, light/dark, local overflow; representative 200% text')
    assert.deepEqual(errors, [], 'Teaching pages have no runtime errors')
  } finally { await page.close() }

  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } })
  try {
    for (const route of ['/craft/geometry', '/studies/reading', '/studies/service', '/studies/workspace']) {
      await noJS.goto(origin + route)
      for (const input of await noJS.locator('.design-lab input,.task-study input').all()) assert(await input.isDisabled(), `${route}: unavailable enhancement is disabled`)
      assert((await noJS.locator('noscript').allTextContents()).join('').length > 20)
    }
    checks.push('no-JavaScript content remains readable and enhanced inputs unavailable')
  } finally { await noJS.close() }
  const touch = await browser.newPage({ hasTouch: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  try {
    await touch.goto(origin + '/studies/service')
    await touch.locator('[data-study="service"]').getByRole('button', { name: 'Review request' }).tap()
    await expect(touch.locator('[data-study="service"] input[aria-invalid="true"]')).toHaveCount(2)
    await touch.goto(origin + '/craft/geometry')
    await touch.locator('[data-lab="geometry"]').screenshot({ path: resolve(directory, `${engine}-native-dpr2-geometry.png`) })
    checks.push('first-touch form activation and native DPR2 geometry capture')
  } finally { await touch.close() }
  const report = { engine, version: browser.version(), figures: figures.filter(entry => entry.component === 'GuideFigure').length, labs: figures.filter(entry => entry.component === 'DesignLab').length, studies: figures.filter(entry => entry.component === 'TaskStudy').length, checks, captures, screenReader: 'Not tested; browser accessibility semantics are not a screen-reader walkthrough.' }
  await writeFile(resolve(directory, `${engine}-report.json`), JSON.stringify(report, null, 2) + '\n')
  return report
}
