import {chromium,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';
const {server,origin}=await startServer();const results=[];
try{for(const [name,engine]of Object.entries({chromium,webkit})){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:1440,height:1100}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await page.evaluate(()=>document.fonts.ready);
 const globals=()=>page.locator('.article-dash-stat-value').allTextContents();const initial=await globals();assert.deepEqual(initial,['4','18','3','84']);
 assert.equal(await page.locator('[data-project]:visible').count(),4);
 await page.locator('#project-search').fill('mobile');assert.equal(await page.locator('[data-project]:visible').count(),1);assert.equal(await page.locator('[data-select]:checked').count(),0);assert.equal(await page.locator('[data-results]').textContent(),'Showing 1 of 4 projects');assert.deepEqual(await globals(),initial);
 await page.locator('[data-select="MN"]').check();assert.equal(await page.locator('[data-selection-count]').textContent(),'1');
 await page.locator('[data-filter="progress"]').click();assert.equal(await page.locator('[data-select]:checked').count(),0);assert.equal(await page.locator('[data-project]:visible').count(),1);
 await page.locator('#project-search').fill('');assert.equal(await page.locator('[data-project]:visible').count(),2);
 await page.locator('[data-filter="archived"]').click();assert.equal(await page.locator('[data-empty]:visible').count(),1);assert.equal(await page.locator('table:visible').count(),0);assert.deepEqual(await globals(),initial);
 await page.locator('[data-reset]').click();await page.locator('[data-clear]').click();assert.equal(await page.locator('[data-select]:checked').count(),0);assert.equal(await page.locator('[data-select="WR"]').evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Control+k');assert.equal(await page.locator('#project-search').evaluate(e=>e===document.activeElement),true);
 for(const width of [1440,900,390,320])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflow ${width}/${theme}`);
 }
 await page.locator('[data-nav-toggle]').click();assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'),'false');
 await page.locator('[data-nav-toggle]').focus();await page.keyboard.press('Enter');await page.locator('nav a[href="#projects"]').click();assert.equal(await page.locator('#projects h3').evaluate(e=>e===document.activeElement),true);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-filter="progress"]').click();assert.equal(await page.locator('[data-project]:visible').count(),2);
 await mkdir('artifacts/browser',{recursive:true});await page.screenshot({path:`artifacts/browser/${name}-mobile-dark.png`,fullPage:true});
 await context.close();const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,deviceScaleFactor:2});const tp=await touch.newPage();await tp.goto(origin);await tp.locator('[data-nav-toggle]').tap();await tp.locator('#project-search').fill('billing');assert.equal(await tp.locator('[data-project]:visible').count(),1);await touch.close();
 const fallback=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await fallback.newPage();await np.goto(origin);assert.equal(await np.locator('[data-project]:visible').count(),4);assert.equal(await np.locator('#project-search').isDisabled(),true);assert.equal(await np.locator('#workspace-navigation').isVisible(),true);assert.ok(await np.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await fallback.close();
 assert.deepEqual(errors,[]);results.push({engine:name,version:browser.version(),result:'pass',viewports:[1440,900,390,320],themes:['light','dark'],checks:['global totals','composed query/status','clear hidden selections','empty results','native keyboard focus','narrow navigation','touch emulation','reduced motion','no JavaScript','no page errors']});await browser.close();
}}finally{server.close();}
await writeFile('artifacts/browser/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
