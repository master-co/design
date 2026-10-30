import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve.mjs';
import { localeIds, samples, kinds } from '../examples/interface-craft/typography-layout/model.mjs';
const out = 'artifacts/typography-check'; await mkdir(out, { recursive: true });
const { server, origin } = await startServer(), results = [];
const near = (a, b, tolerance = .1) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
const ready = async page => { await page.evaluate(() => document.fonts.ready); await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode()))); };
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(), context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/typography-layout.html'); await ready(page);
    const metrics = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('[data-study-rows] [data-row]')].map(row => { const box = row.getBoundingClientRect(), target = row.querySelector('button').getBoundingClientRect(); return { mode: row.getAttribute('data-row'), height: box.height, target: target.height, targetTop: target.top - box.top }; }),
      tables: [...document.querySelectorAll('[data-study-tables] tr')].map(row => row.getBoundingClientRect().height),
      inline: [...document.querySelectorAll('[data-study-inline] p')].map(p => p.getBoundingClientRect().height),
      support: { autospace: CSS.supports('text-autospace', 'normal'), punctuation: CSS.supports('text-spacing-trim', 'trim-start'), ideographic: CSS.supports('text-box', 'trim-both ideographic') },
    }));
    assert.deepEqual(metrics.rows.map(row => row.height), [36, 24, 36]); assert(metrics.rows.every(row => row.target === 36)); near(metrics.rows[1].targetTop, -6);
    near(metrics.tables[0], 52); near(metrics.tables[1], 40); assert(metrics.inline[0] > metrics.inline[1]);
    // Prove the compensated target really remains clickable above the row boundary.
    await page.locator('[data-study-rows] [data-row=compensated] button').scrollIntoViewIfNeeded();
    const hit = await page.locator('[data-study-rows] [data-row=compensated] button').evaluate(button => { const b = button.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + 2) === button; }); assert.equal(hit, true);
    const action = page.locator('[data-study-rows] [data-row=compensated] button'); const bounds = await action.boundingBox(); await action.focus(); await page.keyboard.press('Enter'); assert.equal(await action.getAttribute('data-saved'), 'true'); assert.deepEqual(await action.boundingBox(), bounds); await action.hover(); assert.deepEqual(await action.boundingBox(), bounds);
    await page.selectOption('[name=measure]', '320'); near((await page.locator('[data-study-rows] [data-row=normal]').boundingBox()).width, 320); await page.selectOption('[name=measure]', '480');
    await page.uncheck('[name=guides]'); assert.equal(await page.locator('[data-study-rows] [data-row=normal]').evaluate(row => getComputedStyle(row).outlineStyle), 'none'); await page.check('[name=guides]');
    const platforms = [];
    for (const locale of localeIds) {
      await page.selectOption('[name=locale]', locale); await ready(page);
      assert.equal(await page.locator('[data-study-cjk] .article-study-metric-line').getAttribute('lang'), locale);
      if (name === 'chromium') {
        const cdp = await context.newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); const { root } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-study-cjk] .article-study-metric-line' }); const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        assert(fonts.some(font => font.isCustomFont && font.familyName.includes(samples[locale].family)), JSON.stringify({ locale, fonts })); platforms.push({ locale, fonts }); await cdp.detach();
      }
      for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) for (const scale of ['1', '2']) {
        await page.setViewportSize({ width, height: 1000 }); await page.selectOption('[name=theme]', theme); await page.selectOption('[name=scale]', scale); await ready(page);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}/${locale}/${width}/${theme}/${scale} overflows`);
        const targets = await page.locator('[data-study-specimens] :is(button,input,select)').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { tag: element.tagName, width: r.width, height: r.height }; })); assert(targets.every(target => target.width > 0 && target.height > 0));
        if (locale === 'zh-TW' && width !== 390 && scale === '1') await page.screenshot({ path: `${out}/${name}-${width}-${theme}.png`, fullPage: true });
      }
    }
    await page.setViewportSize({ width: 390, height: 1000 }); await page.selectOption('[name=scale]', '1'); await page.selectOption('[name=locale]', 'en'); await ready(page);
    assert.equal(await page.locator('[data-study-specimens] .article-study-specimen').count(), kinds.length);
    const specimens = page.locator('[data-study-specimens]'); await specimens.locator('input[type=checkbox]').first().check(); assert(await specimens.locator('input[type=checkbox]').first().isChecked()); await specimens.locator('input[role=switch]').check(); assert(await specimens.locator('input[role=switch]').isChecked()); await specimens.locator('input[type=radio]').check(); await specimens.locator('input.article-study-input').fill('Long project name'); await specimens.locator('select').selectOption({ index: 1 }); assert.equal(await specimens.locator('select').inputValue(), 'Paused');
    assert(await page.locator('.article-study-main>section button:disabled').isDisabled());
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } }), np = await nojs.newPage(); await np.goto(origin + '/typography-layout.html'); await ready(np); assert.equal(await np.locator('[data-row]').count(), 14); assert.equal(await np.locator('.article-study-settings fieldset').getAttribute('disabled'), ''); assert(await np.locator('[data-study-action]').first().isDisabled()); assert.equal(await np.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); await nojs.close();
    const touch = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), tp = await touch.newPage(); await tp.goto(origin + '/typography-layout.html'); await ready(tp); await tp.locator('[data-study-specimens] [data-kind=switch] input').tap(); assert(await tp.locator('[data-study-specimens] [data-kind=switch] input').isChecked()); const touchTarget = await tp.locator('[data-study-rows] [data-row=compensated] button').boundingBox(); assert(touchTarget.height >= 44); await touch.close();
    // Record native, unscaled comparisons separately from the explanatory plates.
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.selectOption('[name=locale]', 'zh-TW'); await page.selectOption('[name=theme]', 'light'); await ready(page); await page.locator('[data-study-rows]').screenshot({ path: `${out}/${name}-native-rows.png` });
    const plates = await context.newPage(); await plates.goto(origin + '/typography-layout-studies.html'); await ready(plates);
    const comparisons = await plates.evaluate(() => ({
      spacing: [...document.querySelectorAll('#C2 p')].map(p => { const r = new Range(); r.selectNodeContents(p); return r.getBoundingClientRect().width; }),
      breaks: [...document.querySelectorAll('#C3 .article-study-wrap')].map(p => { const lines = []; for (let i = 0; i < p.firstChild.textContent.length; i++) { const r = new Range(); r.setStart(p.firstChild, i); r.setEnd(p.firstChild, i + 1); const box = r.getBoundingClientRect(), last = lines.at(-1); if (last && Math.abs(last.y - box.top) < 1) last.text += r.toString(); else lines.push({ y: box.top, text: r.toString() }); } return { lang: p.lang, lines: lines.map(line => line.text) }; }),
    }));
    if (metrics.support.autospace) assert(comparisons.spacing[1] > comparisons.spacing[0]);
    if (metrics.support.punctuation) assert(comparisons.spacing[3] < comparisons.spacing[2]); else near(comparisons.spacing[3], comparisons.spacing[2]);
    for (let i = 0; i < comparisons.breaks.length; i += 2) assert.notDeepEqual(comparisons.breaks[i].lines, comparisons.breaks[i + 1].lines);
    await plates.close();
    assert.deepEqual(errors, []); results.push({ engine: name, version: browser.version(), metrics, platforms, comparisons, coverage: '5 locales × 3 widths × 2 themes × 2 text sizes; keyboard, hover, native control input, touch emulation, no JavaScript', result: 'pass' });
    await browser.close();
  }
} finally { server.close(); }
await writeFile(out + '/results.json', JSON.stringify({ date: '2026-10-30', method: 'Real DOM bounds and browser-rendered local fonts. Text-size control is not OS/browser zoom; touch and device density are emulated.', results }, null, 2) + '\n');
console.log('Typography/layout checks passed in Chromium and WebKit.');
