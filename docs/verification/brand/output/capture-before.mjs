import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(new URL('before/index.html', root).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('before-desktop.png', import.meta.url).pathname, fullPage: true });
const metrics = await page.evaluate(() => Object.fromEntries(['main', 'h1', '.card', '.row', '.actions', 'button', '.meta'].map(selector => {
  const element = document.querySelector(selector);
  const r = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return [selector, { x: r.x, y: r.y, width: r.width, height: r.height, font: style.font, border: style.border, radius: style.borderRadius, shadow: style.boxShadow }];
})));
await page.setViewportSize({ width: 320, height: 640 });
await page.screenshot({ path: new URL('before-mobile.png', import.meta.url).pathname, fullPage: true });
await writeFile(new URL('before-metrics.json', import.meta.url), JSON.stringify({ browser: browser.version(), deviceScaleFactor: 1, metrics }, null, 2));
await browser.close();
