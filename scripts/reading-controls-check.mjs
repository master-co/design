import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from '@playwright/test';
import { startServer } from './serve.mjs';
import { localeIds } from '../examples/interface-craft/typography-layout/model.mjs';
import { command } from '../examples/interface-craft/typography-layout/reading-controls.mjs';

const output = 'artifacts/reading-controls';
await mkdir(output, { recursive: true });
const { server, origin } = await startServer();
const report = { checkedAt: new Date().toISOString(), engines: [] };
const near = (a, b) => assert.ok(Math.abs(a - b) < .1, `${a} differs from ${b}`);
const ready = page => page.evaluate(() => document.fonts.ready);

try {
  for (const [engine, type] of Object.entries({ chromium, webkit })) {
    const browser = await type.launch();
    try {
      const result = { engine, version: browser.version(), layouts: [], touch: [], noScript: false, reducedMotion: false };
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + '/typography-layout.html'); await ready(page);
      const geometry = await page.locator('[data-reading-heading]').evaluateAll(nodes => nodes.map(node => {
        const wrapper = node.querySelector('.article-study-reading-target'), anchor = wrapper.querySelector('a');
        return { mode: node.dataset.readingHeading, line: parseFloat(getComputedStyle(wrapper).lineHeight), layout: wrapper.getBoundingClientRect().height, target: anchor.getBoundingClientRect().height };
      }));
      near(geometry[0].layout, 44); near(geometry[1].layout, geometry[1].line);
      assert.ok(geometry[1].layout < 44); assert.ok(geometry.every(row => row.target >= 44));
      result.geometry = geometry;
      const anchor = page.locator('[data-reading-heading=independent] a');
      await anchor.scrollIntoViewIfNeeded();
      assert.equal(await anchor.evaluate(node => {
        const target = node.getBoundingClientRect(), heading = node.closest('h4'), paragraph = heading.nextElementSibling.getBoundingClientRect();
        return target.bottom < paragraph.top && [target.top + 1, target.bottom - 1].every(y => document.elementFromPoint(target.left + target.width / 2, y)?.closest('a') === node);
      }), true);
      await anchor.focus(); assert.notEqual(await anchor.evaluate(node => getComputedStyle(node).outlineStyle), 'none');
      await anchor.click({ position: { x: 4, y: 1 } }); assert.equal(new URL(page.url()).hash, '#reading-command');

      for (const locale of localeIds) {
        await page.selectOption('[name=locale]', locale);
        for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) for (const scale of ['1', '2']) {
          await page.setViewportSize({ width, height: 1000 });
          await page.selectOption('[name=theme]', theme); await page.selectOption('[name=scale]', scale); await ready(page);
          const metrics = await page.evaluate(() => {
            const anchor = document.querySelector('[data-reading-heading=independent] a');
            const title = document.querySelector('.article-study-reading-column>span'), arrow = document.querySelector('.article-study-reading-column>svg');
            const text = title.getBoundingClientRect(), icon = arrow.getBoundingClientRect();
            return { overflow: document.documentElement.scrollWidth > innerWidth, target: anchor.getBoundingClientRect().height, separateColumn: icon.left > text.right, alignmentError: Math.abs(icon.top + icon.height / 2 - text.top - parseFloat(getComputedStyle(title).lineHeight) / 2) };
          });
          assert.equal(metrics.overflow, false, `${engine}/${locale}/${width}/${theme}/${scale}`);
          assert.ok(metrics.target >= 44); assert.equal(metrics.separateColumn, true); assert.ok(metrics.alignmentError < .1);
          result.layouts.push({ locale, width, theme, scale, ...metrics });
        }
      }
      await page.selectOption('[name=scale]', '1'); await page.selectOption('[name=locale]', 'en');
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const arrow = page.locator('.article-study-reading-column>svg');
      await arrow.scrollIntoViewIfNeeded(); const before = await arrow.boundingBox();
      await page.locator('.article-study-reading-column').hover(); near((await arrow.boundingBox()).x, before.x);
      result.reducedMotion = true;
      await page.mouse.move(0, 0); await page.evaluate(() => document.activeElement?.blur());
      await page.locator('[data-study-reading]').screenshot({ path: `${output}/${engine}-390-dark.png` });
      await page.close();

      for (const locale of localeIds) {
        const context = await browser.newContext({ viewport: { width: 390, height: 900 }, hasTouch: true, isMobile: true });
        await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__readingCopied = text; } } }));
        const touch = await context.newPage(); await touch.goto(origin + '/typography-layout.html');
        await touch.selectOption('[name=locale]', locale); await ready(touch);
        const copy = touch.locator('[data-reading-copy]');
        assert.equal(await copy.evaluate(node => getComputedStyle(node).opacity), '1');
        const bounds = await copy.boundingBox(); assert.ok(bounds.width >= 44 && bounds.height >= 44);
        if (locale === 'en') await touch.locator('.article-study-reading-code').screenshot({ path: `${output}/${engine}-touch.png` });
        await copy.tap(); await touch.waitForFunction(() => typeof window.__readingCopied === 'string');
        assert.equal(await touch.evaluate(() => window.__readingCopied), command);
        assert.equal(await touch.locator('.article-study-reading-code code').textContent(), command);
        await touch.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('unavailable'); } } }));
        await copy.tap(); await touch.waitForFunction(() => document.activeElement?.tagName === 'PRE');
        assert.equal(await copy.getAttribute('data-copied'), null);
        assert.ok((await touch.locator('[data-reading-copy-status]').textContent()).includes('Select the command'));
        result.touch.push({ locale, directFirstTap: true, exactCopy: true, failureFallback: true });
        await context.close();
      }
      const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
      const staticPage = await staticContext.newPage(); await staticPage.goto(origin + '/typography-layout.html');
      assert.equal(await staticPage.locator('[data-reading-copy]').isVisible(), false);
      assert.equal(await staticPage.locator('.article-study-reading-code code').textContent(), command);
      await staticPage.locator('[data-reading-heading=independent] a').click();
      assert.equal(new URL(staticPage.url()).hash, '#reading-command');
      result.noScript = true; await staticContext.close();
      assert.deepEqual(errors, []); result.result = 'pass'; report.engines.push(result);
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.close(resolve)); }
await writeFile(output + '/results.json', JSON.stringify(report, null, 2) + '\n');
console.log('Reading controls passed: two engines, 120 layout combinations, ten touch checks, keyboard, reduced motion and static fallback.');
