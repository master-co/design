import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {startServer} from './serve.mjs';
import {plates} from '../examples/interface-craft/studies.mjs';
const {server,origin}=await startServer();const results=[];await mkdir('artifacts/native',{recursive:true});
try{for(const[name,engine]of Object.entries({chromium,webkit})){
 const browser=await engine.launch();for(const dpr of [1,2,3,1.25,1.5]){
 const context=await browser.newContext({viewport:{width:720,height:600},deviceScaleFactor:dpr});const page=await context.newPage();
 await page.goto(origin+'/studies.html');
 await page.evaluate(body=>{
  document.body.innerHTML='<div class="sample"></div><div class="md-image-shell native-image"><img class="image md-image-outlined" src="./image-study.svg" width="192" height="132" alt="Native image edge"></div>'+body;
  const style=document.createElement('style');style.textContent='body{margin:0;background:#f7f7f7;font-family:Geist}.sample{position:absolute;left:40px;top:40px;width:180px;height:90px;border-radius:16px;background:#fcfcfc;box-shadow:var(--md-ring)}.native-image{position:absolute;left:300px;top:40px;padding:0;margin:0;width:192px;background:none}.md-sample{top:200px;left:40px;transform:none}.md-sample:not(.md-right),.md-divider,.md-label{display:none}.md-amount-row>span{display:inline-block}';document.head.append(style);
 },plates.find(p=>p.id==='20-numeric-columns').body);
 await page.evaluate(async()=>{await document.fonts.load('400 23px Geist','0123456789,.−');await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.locator('img').evaluate(i=>i.decode());
 const metrics=await page.evaluate(()=>({dpr:devicePixelRatio,font:document.fonts.check('23px Geist'),numberStyles:[...document.querySelectorAll('.md-right .md-amount-row>span')].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{text:e.textContent,font:s.font,kerning:s.fontKerning,numeric:s.fontVariantNumeric,align:s.textAlign,left:r.left,width:r.width};}),decimals:[...document.querySelectorAll('.md-right .md-amount-row>span')].map(e=>{const i=e.firstChild.textContent.indexOf('.'),r=new Range();r.setStart(e.firstChild,i);r.setEnd(e.firstChild,i+1);return r.getBoundingClientRect().left;}),image:(()=>{const e=document.querySelector('img'),s=getComputedStyle(e);return{width:e.width,height:e.height,radius:s.borderRadius,offset:s.outlineOffset};})()}));
 await writeFile(`artifacts/native/${name}-${dpr}-metrics.json`,JSON.stringify({engine:name,version:browser.version(),...metrics},null,2));
 assert.equal(metrics.dpr,dpr);assert.equal(metrics.font,true);assert.ok(Math.max(...metrics.decimals)-Math.min(...metrics.decimals)<=.3,JSON.stringify({engine:name,dpr,...metrics}));assert.equal(metrics.image.width,192);assert.equal(metrics.image.height,132);assert.equal(metrics.image.radius,'12px');assert.ok(Math.abs(parseFloat(metrics.image.offset)+1)*dpr<=.51,'computed inward offset is quantized within half a device pixel');
 const file=`artifacts/native/${name}-${dpr}.png`;const image=await page.screenshot({path:file});const meta=await sharp(image).metadata();assert.equal(meta.width,Math.round(720*dpr));assert.equal(meta.height,Math.round(600*dpr));
 const {data,info}=await sharp(image).removeAlpha().raw().toBuffer({resolveWithObject:true});const at=(x,y)=>[...data.subarray((Math.round(y*dpr)*info.width+Math.round(x*dpr))*3,(Math.round(y*dpr)*info.width+Math.round(x*dpr))*3+3)];
 // Native pixels are saved without resizing. Coverage is sampled, not inferred from enlarged geometry.
 results.push({engine:name,version:browser.version(),dpr,...metrics,pixels:{outside:at(30,70),surface:at(100,70),edge:at(39,70),edgeColumns:[38,39,40,41,42].map(x=>at(x,70))},file,result:'pass'});await context.close();
 }await browser.close();}}finally{server.close();}
await writeFile('artifacts/native/results.json',JSON.stringify({method:'Browser-emulated device pixel density; unresampled screenshots. Not OS zoom or hardware display testing.',results},null,2));console.log(`Native raster checks passed: ${results.length} engine/density combinations.`);
