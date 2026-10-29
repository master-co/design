import { chromium, webkit } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const pageUrl = new URL('../work/index.html', import.meta.url).href;
const results = { checks: [], browsers: {}, metrics: {}, fonts: {}, digitWidths: {}, keyboardBaseline: {}, errors: [] };
const check = async (name, test) => {
  try { await test(); results.checks.push({ name, passed: true }); }
  catch (error) { results.checks.push({ name, passed: false, error: error.message }); }
};
const screenshot = (page, name) => page.screenshot({ path: new URL(name, import.meta.url).pathname, fullPage: true });
const selected = page => page.locator('.actions button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-pressed')));
const bounds = page => page.locator('.actions button').evaluateAll(buttons => buttons.map(button => {
  const { x, y, width, height } = button.getBoundingClientRect();
  return { x, y, width, height };
}));
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  results.browsers[engine] = browser.version();
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(`${engine}: ${error.message}`));
  if (engine === 'webkit') {
    for (const fixture of ['before', 'work']) {
      await page.goto(new URL(`../${fixture}/index.html`, import.meta.url).href);
      await page.keyboard.press('Tab');
      const tabTarget = await page.evaluate(() => document.activeElement.tagName);
      await page.keyboard.press('Alt+Tab');
      const optionTabTarget = await page.evaluate(() => document.activeElement.textContent);
      results.keyboardBaseline[fixture] = { tabTarget, optionTabTarget };
    }
    await check('webkit: native keyboard traversal matches baseline', async () => {
      assert.deepEqual(results.keyboardBaseline.before, results.keyboardBaseline.work);
      assert.deepEqual(results.keyboardBaseline.work, { tabTarget: 'BODY', optionTabTarget: 'Ready' });
    });
  }
  await page.goto(pageUrl);
  await page.evaluate(() => document.fonts.ready);
  await check(`${engine}: initial selection and named group`, async () => {
    assert.deepEqual(await selected(page), ['true', 'false']);
    assert.equal(await page.getByRole('group', { name: 'Dispatch view' }).count(), 1);
  });
  const initialBounds = await bounds(page);
  await check(`${engine}: pointer switching, reversal, repeated input and stable bounds`, async () => {
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'In transit' }).click();
      assert.deepEqual(await selected(page), ['false', 'true']);
      assert.deepEqual(await bounds(page), initialBounds);
      await page.getByRole('button', { name: 'Ready', exact: true }).click();
      assert.deepEqual(await selected(page), ['true', 'false']);
    }
    await page.mouse.move(950, 600);
  });
  await screenshot(page, `after-desktop-${engine}.png`);
  results.metrics[engine] = await page.evaluate(() => Object.fromEntries(['main', 'h1', '.card', '.row', '.actions', 'button', '.meta'].map(selector => {
    const element = document.querySelector(selector);
    const { x, y, width, height } = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [selector, { x, y, width, height, font: style.font, border: style.border, radius: style.borderRadius, shadow: style.boxShadow }];
  })));
  await check(`${engine}: equal rendered digit widths in route values`, async () => {
    results.digitWidths[engine] = await page.locator('dd').first().evaluate(element => {
      const span = document.createElement('span');
      span.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
      element.append(span);
      const widths = Array.from({ length: 10 }, (_, digit) => {
        span.textContent = String(digit);
        return span.getBoundingClientRect().width;
      });
      span.remove();
      return widths;
    });
    assert.equal(Math.max(...results.digitWidths[engine]) - Math.min(...results.digitWidths[engine]) < .01, true);
  });
  await check(`${engine}: single divider and no transform while pressed`, async () => {
    const border = await page.locator('.actions button').evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return { left: style.borderLeftWidth, right: style.borderRightWidth };
    }));
    assert.deepEqual(border, [{ left: '0px', right: '0px' }, { left: '2px', right: '0px' }]);
    await page.getByRole('button', { name: 'Ready', exact: true }).hover();
    await page.mouse.down();
    assert.deepEqual(await bounds(page), initialBounds);
    assert.equal(await page.locator('button').first().evaluate(button => getComputedStyle(button).transform), 'none');
    await screenshot(page, `after-pressed-${engine}.png`);
    await page.mouse.up();
  });
  await page.reload();
  await check(`${engine}: keyboard focus, Space and Enter switching`, async () => {
    const forward = engine === 'webkit' ? 'Alt+Tab' : 'Tab';
    const backward = engine === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
    await page.keyboard.press(forward);
    assert.equal(await page.locator('button').first().evaluate(button => button === document.activeElement && button.matches(':focus-visible')), true);
    await page.keyboard.press(forward);
    await page.keyboard.press('Space');
    assert.deepEqual(await selected(page), ['false', 'true']);
    assert.equal(await page.locator('button').last().evaluate(button => getComputedStyle(button).outlineWidth), '2px');
    await screenshot(page, `after-keyboard-${engine}.png`);
    await page.keyboard.press(backward);
    await page.keyboard.press('Enter');
    assert.deepEqual(await selected(page), ['true', 'false']);
  });
  if (engine === 'chromium') {
    const client = await context.newCDPSession(page);
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    const { root } = await client.send('DOM.getDocument');
    for (const selector of ['h1', 'h2', 'dt', 'dd', 'button']) {
      const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector });
      results.fonts[selector] = (await client.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
    }
  }
  for (const width of [320, 375, 440, 768]) {
    await page.setViewportSize({ width, height: 640 });
    await check(`${engine}: ${width}px layout without horizontal overflow`, async () => {
      assert.equal(await fits(page), true);
      const boxes = await bounds(page);
      assert.equal(boxes.every(box => box.width >= 24 && box.height >= 24), true);
    });
    if (width === 320) {
      await page.mouse.move(310, 600);
      await page.locator('button').first().evaluate(button => button.blur());
      await screenshot(page, `after-mobile-${engine}.png`);
    }
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await check(`${engine}: longer content and four-digit value at 320px`, async () => {
    await page.locator('h2').evaluate(element => element.textContent = 'North quay dispatch terminal');
    await page.locator('dt').first().evaluate(element => element.textContent = 'Dispatch window for northern terminal');
    await page.locator('dd').last().evaluate(element => element.textContent = '1,888');
    assert.equal(await fits(page), true);
    for (const row of await page.locator('.row').all()) {
      const label = await row.locator('dt').boundingBox();
      const value = await row.locator('dd').boundingBox();
      assert.equal(label.x + label.width <= value.x, true);
    }
    await screenshot(page, `after-long-content-${engine}.png`);
  });
  await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await check(`${engine}: reduced-motion switching`, async () => {
    await page.locator('button').last().click();
    assert.deepEqual(await selected(page), ['false', 'true']);
  });
  if (engine === 'chromium') {
    await page.emulateMedia({ forcedColors: 'active' });
    await check('chromium: selected cue and focus in forced colors', async () => {
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator('button').last().evaluate(button => getComputedStyle(button, '::after').height), '2px');
      assert.equal(await page.locator('button').last().evaluate(button => getComputedStyle(button, '::after').backgroundColor !== 'rgba(0, 0, 0, 0)'), true);
      await screenshot(page, 'after-forced-colors.png');
    });
  }
  await context.close();
  const touch = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const touchPage = await touch.newPage();
  await touchPage.goto(pageUrl);
  await check(`${engine}: touch switching and reversal at DPR 2`, async () => {
    await touchPage.getByRole('button', { name: 'In transit' }).tap();
    assert.deepEqual(await selected(touchPage), ['false', 'true']);
    await screenshot(touchPage, `after-touch-dpr2-${engine}.png`);
    await touchPage.getByRole('button', { name: 'Ready', exact: true }).tap();
    assert.deepEqual(await selected(touchPage), ['true', 'false']);
  });
  await touch.close();
  const noScript = await browser.newContext({ viewport: { width: 320, height: 640 }, javaScriptEnabled: false });
  const staticPage = await noScript.newPage();
  await staticPage.goto(pageUrl);
  await check(`${engine}: readable initial route with JavaScript disabled`, async () => {
    assert.equal(await staticPage.locator('h2').textContent(), 'North quay');
    assert.deepEqual(await selected(staticPage), ['true', 'false']);
    assert.equal(await fits(staticPage), true);
  });
  await noScript.close();
  await browser.close();
}
await writeFile(new URL('checks.json', import.meta.url), JSON.stringify(results, null, 2));
const failures = results.checks.filter(check => !check.passed);
console.log(JSON.stringify({ passed: results.checks.length - failures.length, failed: failures, errors: results.errors, browsers: results.browsers }, null, 2));
if (failures.length || results.errors.length) process.exitCode = 1;
