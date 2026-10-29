import {chromium,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';
import {renderDashboard} from '../examples/interface-craft/original/dashboard.mjs';
const {server,origin}=await startServer();const output='artifacts/dashboard';await mkdir(output,{recursive:true});const results=[];
const selectors=['.article-dash-shell','.article-dash-main','.article-dash-brand','.article-dash-search','.article-dash-nav-label','.article-dash-nav-item','.article-dash-account','.article-dash-topbar','.article-dash-title-row h2','.article-dash-title-row p','.article-dash-stats','.article-dash-stat','.article-dash-middle','.article-dash-chart-shell','.article-dash-line-chart','.article-dash-next','.article-dash-next-task','.article-dash-projects-shell','.article-dash-projects-heading h3','.article-dash-projects-panel table'];
const measure=async(page)=>page.evaluate(selectors=>{
 const plate=document.querySelector('.article-dashboard-plate').getBoundingClientRect();
 const rect=e=>{const b=e.getBoundingClientRect();return{x:b.x-plate.x,y:b.y-plate.y,width:b.width,height:b.height};};
 return{parts:Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(rect)])),nav:[...document.querySelectorAll('.article-dash-nav-item')].map(e=>({color:getComputedStyle(e).color,icon:rect(e.querySelector('svg'))})),headers:[...document.querySelectorAll('th')].slice(0,7).map(rect),checks:[...document.querySelectorAll('tbody tr')].map(e=>{const b=(e.querySelector('input')||e.querySelector('.article-dash-checkbox')).getBoundingClientRect();return{x:b.x-plate.x,y:b.y-plate.y,width:b.width,height:b.height};}),rowHeights:[...document.querySelectorAll('tbody tr')].map(e=>e.getBoundingClientRect().height)};
},selectors);
const close=(a,b,label,tolerance=.1)=>assert.ok(Math.abs(a-b)<=tolerance,`${label}: ${a} vs ${b}`);
try{for(const[name,engine]of Object.entries({chromium,webkit})){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:2});const page=await context.newPage();await page.goto(origin+'/?capture&theme=light');await page.evaluate(()=>document.fonts.ready);
 const baseline=await context.newPage();await baseline.goto(origin+'/studies.html');await baseline.setContent(renderDashboard().replace(/<head>[\s\S]*?<\/head>/,`<head><link rel="stylesheet" href="${origin}/fonts.css"><link rel="stylesheet" href="${origin}/original/styles.css"><link rel="stylesheet" href="${origin}/tokens.css"></head>`));await baseline.evaluate(()=>document.fonts.ready);
 const before=await measure(baseline),after=await measure(page);
 for(const selector of selectors){assert.equal(after.parts[selector].length,before.parts[selector].length,selector);for(let i=0;i<before.parts[selector].length;i++)for(const key of ['x','y','width','height'])close(after.parts[selector][i][key],before.parts[selector][i][key],`${name} ${selector}[${i}].${key}`);}
 assert.deepEqual(after.nav.map(n=>n.color),before.nav.map(n=>n.color),'Retain resting/current navigation colors');
 for(let i=0;i<before.nav.length;i++)assert.deepEqual(after.nav[i].icon,before.nav[i].icon,'Retain navigation icon geometry');
 for(let i=0;i<7;i++)close(after.headers[i].x,before.headers[i].x,'Original table column '+i);
 for(let i=0;i<4;i++)for(const key of ['x','y','width','height'])close(after.checks[i][key],before.checks[i][key],'Original checkbox '+i+' '+key);
 assert.deepEqual(after.rowHeights,[40,40,40,40]);
 const date=await page.locator('.md-date').evaluate(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return{width:b.width,height:b.height,radius:s.borderRadius,shadow:s.boxShadow};});assert.equal(date.width,212);assert.equal(date.height,34);assert.equal(date.radius,'10px');assert.notEqual(date.shadow,'none');
 await page.locator('.article-dashboard-plate').screenshot({path:output+'/'+name+'-desktop.png'});
 const beforeCheck=await page.locator('[data-select="MN"]').boundingBox();await page.locator('[data-select="MN"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-select="MN"]').isChecked(),true);assert.equal(await page.locator('[data-select="MN"]').evaluate(e=>e.matches(':focus-visible')),true);assert.deepEqual(await page.locator('[data-select="MN"]').boundingBox(),beforeCheck);
 await page.locator('.article-dash-projects-panel').screenshot({path:output+'/'+name+'-keyboard.png'});
 for(const width of [390,320])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:900});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const compact=await page.locator('.md-date').evaluate(e=>({width:e.clientWidth,content:e.scrollWidth,height:e.getBoundingClientRect().height}));assert.ok(compact.content<=compact.width);assert.equal(compact.height,34);
  await page.locator('[data-nav-toggle]').click();assert.equal(await page.locator('#workspace-navigation').isVisible(),true);
  const mobileColors=await page.locator('nav .article-dash-nav-item').evaluateAll(links=>links.map(e=>getComputedStyle(e).color));assert.notEqual(mobileColors[0],mobileColors[1]);
  await page.screenshot({path:`${output}/${name}-${width}-${theme}-nav.png`,fullPage:true});await page.keyboard.press('Escape');
  const target=await page.locator('.md-check-target').first().boundingBox();assert.ok(target.height>=44&&target.width>=44);
  if(theme==='dark'){assert.equal(await page.locator('.article-finish-track').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(65, 65, 74)');assert.equal(await page.locator('td[data-label=Status]').first().evaluate(e=>getComputedStyle(e,'::before').color),'rgb(170, 170, 178)');}
  await page.locator('#projects').screenshot({path:`${output}/${name}-${width}-${theme}-projects.png`});
 }
 for(const width of [901,1100]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.documentElement.dataset.theme='light');const fits=await page.locator('td[data-label=Progress]').evaluateAll(cells=>cells.every(td=>td.querySelector('.article-finish-progress').getBoundingClientRect().right<=td.getBoundingClientRect().right+.1));assert(fits,'Progress must remain inside its actual column');}
 // Verify actual checkbox rasterization, not an enlarged geometry diagram.
 const raster=[];for(const dpr of [1,2,3,1.25,1.5]){const c=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:dpr});const p=await c.newPage();await p.goto(origin+'/?capture&theme=light');await p.evaluate(()=>document.fonts.ready);const checkbox=await p.locator('[data-select="MN"]').evaluate(e=>({appearance:getComputedStyle(e).appearance,width:e.getBoundingClientRect().width}));assert.equal(checkbox.appearance,'none');assert.equal(checkbox.width,11);await p.locator('.article-dash-projects-panel').screenshot({path:`${output}/${name}-controls-${dpr}.png`});raster.push({dpr,...checkbox});await c.close();}
 if(name==='chromium'){await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('[data-select="MN"]').evaluate(e=>getComputedStyle(e).appearance),'auto');await page.locator('[data-select="MN"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-select="MN"]').isChecked(),false);await page.locator('#projects').screenshot({path:output+'/forced-colors.png'});}
 results.push({engine:name,version:browser.version(),baseline:'4733743 approved dashboard source',comparedParts:selectors,nav:after.nav,checkboxes:after.checks,rowHeights:after.rowHeights,date,raster,result:'pass'});await browser.close();
}}finally{server.close();}
await writeFile(output+'/results.json',JSON.stringify({date:'2026-10-30',results},null,2)+'\n');console.log('Dashboard detail checks passed: approved geometry, sidebar paint, table starts, checkbox states, date surface, mobile layout and native densities.');
