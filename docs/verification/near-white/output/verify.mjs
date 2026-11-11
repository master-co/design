import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const url = new URL('../work/index.html', import.meta.url).href;
const out = name => new URL(name, import.meta.url).pathname;
const results = { engines: {}, checks: [], metrics: {} };
const check = (name, detail) => results.checks.push({name, passed:true, ...detail});
const bounds = locator => locator.boundingBox();
const near = (a,b,tol=0.1) => Math.abs(a-b) <= tol;
function sameBox(a,b,name) {
  assert.ok(a && b && ['x','y','width','height'].every(k=>near(a[k],b[k])), `${name}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}
for (const [engineName, engine] of Object.entries({chromium,webkit})) {
  let browser;
  try { browser = await engine.launch({headless:true}); }
  catch(error) { results.engines[engineName] = {available:false,error:String(error)}; continue; }
  results.engines[engineName] = { available:true, version:browser.version() };
  const page = await browser.newPage({viewport:{width:900,height:650},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(() => { window.initialTransitions=[]; document.addEventListener('transitionrun',e=>window.initialTransitions.push(e.propertyName)); });
  await page.goto(url);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(80);
  assert.deepEqual(await page.evaluate(()=>window.initialTransitions),[]);
  check(`${engineName}: initial render has no transition`);
  const tabKey=engineName==='webkit'?'Alt+Tab':'Tab';
  await page.keyboard.press(tabKey);
  assert.equal(await page.locator('#value').evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press(tabKey);
  assert.equal(await page.locator('#toggle').evaluate(e=>e===document.activeElement),true);
  await page.locator('#toggle').blur();
  check(`${engineName}: native ${tabKey} order is Next value then Open details`);
  const value = page.locator('#value'), toggle = page.locator('#toggle'), panel=page.locator('#panel');
  const valueBox=await bounds(value), toggleBox=await bounds(toggle), numberBox=await bounds(page.locator('.number'));
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await panel.getAttribute('aria-hidden'),'true');
  assert.equal(await panel.evaluate(e=>e.inert),true);
  assert.equal(await page.locator('.viewport').evaluate(e=>e.getBoundingClientRect().height),0);
  await page.screenshot({path:out(`after-${engineName}-desktop-closed.png`)});
  check(`${engineName}: initial state closed, no occupied panel space, hidden/inert content`);
  const actualTextWidths = {};
  for (const expected of ['08:08','12:34','11:11','08:08','12:34','11:11']) {
    await value.click();
    assert.equal(await page.locator('#elapsed').textContent(),expected);
    actualTextWidths[expected]=await page.locator('#elapsed').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width;});
    sameBox(await bounds(value),valueBox,'value control stable');
    sameBox(await bounds(toggle),toggleBox,'toggle stable during value changes');
    sameBox(await bounds(page.locator('.number')),numberBox,'value slot stable');
  }
  assert.ok(Math.max(...Object.values(actualTextWidths))-Math.min(...Object.values(actualTextWidths))<0.1);
  results.metrics[`${engineName}-rendered-value-widths`]=actualTextWidths;
  check(`${engineName}: six value changes preserve the original cycle and layout`);
  await page.keyboard.press('Tab');
  await toggle.focus();
  assert.equal(await toggle.evaluate(e=>e.matches(':focus-visible')),true);
  const focusStyle=await toggle.evaluate(e=>({width:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle}));
  assert.equal(focusStyle.width,'2px');
  await page.screenshot({path:out(`after-${engineName}-keyboard-focus.png`)});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(240);
  assert.equal(await toggle.textContent(),'Close details');
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert.equal(await panel.evaluate(e=>e.inert),false);
  sameBox(await bounds(toggle),toggleBox,'toggle stable when open');
  await page.screenshot({path:out(`after-${engineName}-desktop-open.png`)});
  await page.keyboard.press('Space');
  await page.waitForTimeout(240);
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  check(`${engineName}: keyboard focus, Enter open and Space close`);
  // Sample an interrupted transition in one browser task to avoid screenshot scheduling gaps.
  const reversal = await page.evaluate(async()=>{
    const control=document.querySelector('#toggle'), viewport=document.querySelector('.viewport');
    const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const height=()=>viewport.getBoundingClientRect().height;
    control.click();
    await pause(65);
    const before=height();
    control.click();
    const immediate=height();
    await pause(32);
    const after=height();
    await pause(220);
    return {before,immediate,after,final:height(),state:control.getAttribute('aria-expanded')};
  });
  assert.ok(reversal.before>0);
  assert.ok(near(reversal.before,reversal.immediate,1));
  assert.ok(reversal.after<reversal.before);
  assert.equal(reversal.final,0);
  assert.equal(reversal.state,'false');
  results.metrics[`${engineName}-reversal`]=reversal;
  check(`${engineName}: mid-transition reversal continues from the current height`);
  await page.evaluate(async()=>{
    const toggle=document.querySelector('#toggle');
    for(let i=0;i<13;i++){toggle.click();await new Promise(r=>setTimeout(r,17));}
  });
  await page.waitForTimeout(240);
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert.equal(await panel.getAttribute('aria-hidden'),'false');
  assert.ok(await page.locator('.viewport').evaluate(e=>e.getBoundingClientRect().height)>70);
  check(`${engineName}: thirteen rapid toggles settle on the last requested state`);
  // Mouse-down feedback must preserve the label and target geometry.
  await value.hover();
  await page.mouse.down();
  sameBox(await bounds(value),valueBox,'pressed target stable');
  assert.equal(await value.evaluate(e=>getComputedStyle(e).transform),'none');
  await page.mouse.up();
  check(`${engineName}: press feedback leaves the control and text geometry stable`);
  for (const width of [320,280,240]) {
    await page.setViewportSize({width,height:650});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const boxes=await Promise.all([bounds(value),bounds(toggle)]);
    assert.ok(boxes.every(b=>b.height>=44 && b.x>=0 && b.x+b.width<=width));
    if(width===320) {
      await page.screenshot({path:out(`after-${engineName}-narrow-open.png`)});
      await toggle.click();await page.waitForTimeout(240);
      await page.screenshot({path:out(`after-${engineName}-narrow-closed.png`)});
      await toggle.click();await page.waitForTimeout(240);
    }
  }
  check(`${engineName}: 320, 280 and 240px widths retain >=44px controls without horizontal overflow`);
  await page.setViewportSize({width:320,height:650});
  await value.evaluate(e=>e.textContent='Next elapsed value');
  await toggle.evaluate(e=>e.textContent='Close project details');
  await page.locator('.panel-copy').evaluate(e=>e.textContent='Layout review and implementation notes for the upcoming project milestone');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  for(const locator of [value,toggle,page.locator('.panel-copy')]) {
    assert.equal(await locator.evaluate(e=>e.scrollWidth>e.clientWidth),false);
  }
  await page.screenshot({path:out(`after-${engineName}-long-content.png`)});
  check(`${engineName}: longer English control and panel text wraps without clipping at 320px`);
  assert.deepEqual(errors,[]);
  check(`${engineName}: no page script errors`);
  await page.close();
  // Touch-enabled context and 2x output are separate from CSS viewport resizing.
  const touch=await browser.newPage({viewport:{width:320,height:650},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  await touch.goto(url);
  await touch.locator('#value').tap();
  assert.equal(await touch.locator('#elapsed').textContent(),'08:08');
  await touch.locator('#toggle').tap();
  await touch.waitForTimeout(240);
  assert.equal(await touch.locator('#toggle').getAttribute('aria-expanded'),'true');
  await touch.screenshot({path:out(`after-${engineName}-touch-2x.png`)});
  check(`${engineName}: touch taps change the value and open details at 320px / DPR2`);
  if(engineName==='chromium') {
    const client=await touch.context().newCDPSession(touch);
    await client.send('DOM.enable');await client.send('CSS.enable');
    const doc=await client.send('DOM.getDocument');
    const node=await client.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#elapsed'});
    results.metrics.actualNumberFont=await client.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});
    results.metrics.typography=await touch.locator('#elapsed').evaluate(e=>{
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
      ctx.font='32px Arial';
      const kerned=Object.fromEntries(['11:11','08:08','12:34'].map(v=>[v,ctx.measureText(v).width]));
      ctx.fontKerning='none';
      const s=getComputedStyle(e);
      return {computedFamily:s.fontFamily,fontSize:s.fontSize,variant:s.fontVariantNumeric,kerning:s.fontKerning,kernedCanvasWidths:kerned,slotWidth:e.getBoundingClientRect().width,strings:Object.fromEntries(['11:11','08:08','12:34'].map(v=>[v,ctx.measureText(v).width]))};
    });
  }
  await touch.close();
  if(engineName==='chromium') {
    for(const density of [1,1.25,2]) {
      const native=await browser.newPage({viewport:{width:900,height:650},deviceScaleFactor:density});
      await native.goto(url);await native.waitForTimeout(80);
      await native.screenshot({path:out(`after-chromium-contour-dpr${density}.png`),clip:{x:140,y:80,width:100,height:140}});
      if(density===1.25)await native.screenshot({path:out('after-chromium-desktop-dpr1.25.png')});
      await native.close();
    }
    check('chromium: native screenshot evidence at DPR1, DPR1.25 and DPR2');
  }
  const reduced=await browser.newPage({viewport:{width:900,height:650},reducedMotion:'reduce'});
  await reduced.goto(url);
  await reduced.waitForTimeout(80);
  await reduced.locator('#toggle').click();
  assert.equal(await reduced.locator('.viewport').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.ok(await reduced.locator('.viewport').evaluate(e=>e.getBoundingClientRect().height)>70);
  await reduced.locator('#toggle').click();
  assert.equal(await reduced.locator('.viewport').evaluate(e=>e.getBoundingClientRect().height),0);
  check(`${engineName}: reduced motion applies state changes without travel or transition`);
  await reduced.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:650}});
  await nojs.goto(url);
  assert.equal(await nojs.locator('#value').isDisabled(),true);
  assert.equal(await nojs.locator('#toggle').isVisible(),false);
  assert.equal(await nojs.locator('#panel').isVisible(),true);
  assert.ok((await nojs.locator('noscript').textContent()).includes('Enable JavaScript'));
  await nojs.screenshot({path:out(`after-${engineName}-no-javascript.png`)});
  check(`${engineName}: no-JavaScript fallback retains details and explains the unavailable value action`);
  await nojs.close();
  if(engineName==='chromium') {
    const forced=await browser.newPage({forcedColors:'active',viewport:{width:900,height:650}});
    await forced.goto(url);await forced.waitForTimeout(80);
    await forced.locator('#toggle').focus();await forced.keyboard.press('Enter');await forced.waitForTimeout(240);
    await forced.screenshot({path:out('after-chromium-forced-colors.png')});
    assert.equal(await forced.locator('#toggle').evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
    check('chromium: forced colors retains focused control and panel boundaries');
    await forced.close();
  }
  await browser.close();
}
const luminance=hex=>{const channels=hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
const contrast=(a,b)=>{const aa=luminance(a),bb=luminance(b);return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05);};
results.metrics.contrast={defaultButtonBoundary:contrast('909094','fcfcfc'),expandedButtonBoundary:contrast('77777b','e9e9eb'),secondaryText:contrast('626265','fcfcfc')};
assert.ok(results.metrics.contrast.defaultButtonBoundary>=3);
assert.ok(results.metrics.contrast.expandedButtonBoundary>=3);
check('calculated: functional button boundaries exceed 3:1 against their fills');
await writeFile(out('verification.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
