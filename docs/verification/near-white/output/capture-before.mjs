import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
for (const [name, width] of [['desktop', 900], ['narrow', 320]]) {
  const page = await browser.newPage({viewport:{width,height:650},deviceScaleFactor:1});
  await page.goto(new URL('../before/index.html',import.meta.url).href);
  await page.screenshot({path:new URL(`before-${name}.png`,import.meta.url).pathname});
  if (name === 'desktop') {
    await page.locator('#toggle').click();
    await page.waitForTimeout(400);
    await page.screenshot({path:new URL('before-open.png',import.meta.url).pathname});
  }
  await page.close();
}
await browser.close();
