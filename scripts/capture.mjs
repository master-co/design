import {chromium} from '@playwright/test';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {startServer} from './serve.mjs';
import {plates} from '../examples/interface-craft/studies.mjs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'artifacts/export');await mkdir(out,{recursive:true});
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const {server,origin}=await startServer();const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2});const page=await context.newPage();const artifacts=[];
async function capture(id,locator){
 const box=await locator.boundingBox();if(box.width!==1440||box.height!==1000)throw new Error(`${id}: expected 1440×1000, got ${box.width}×${box.height}`);
 const png=resolve(out,id+'.png'),webp=resolve(out,id+'.webp'),thumbnail=resolve(out,id+'-thumb.webp');await locator.screenshot({path:png});await sharp(png).webp({quality:94}).toFile(webp);await sharp(png).resize(576,400).webp({quality:85}).toFile(thumbnail);
 const meta=await sharp(png).metadata();artifacts.push({id,png:relative(root,png),webp:relative(root,webp),thumbnail:relative(root,thumbnail),width:meta.width,height:meta.height,sha256:await hash(webp),pngSha256:await hash(png)});
}
try{
 await page.goto(origin+'/studies.html');await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 for(const plate of plates)await capture(plate.id,page.locator('[id="'+plate.id+'"]'));
 await page.goto(origin+'/?capture&theme=light');await page.evaluate(()=>document.fonts.ready);await capture('35-in-context',page.locator('.article-dashboard-plate'));
 const sourceHashes={};async function collect(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(['node_modules','.git','artifacts'].includes(e.name))continue;const p=resolve(dir,e.name);if(e.isDirectory())await collect(p);else sourceHashes[relative(root,p)]=await hash(p);}}
 await collect(resolve(root,'skills'));await collect(resolve(root,'examples/interface-craft'));await collect(resolve(root,'scripts'));for(const file of ['bun.lock','package.json','tsconfig.json'])sourceHashes[file]=await hash(resolve(root,file));
 const manifest={version:1,date:'2026-10-30',skill:'master-design',skillVersion:'0.1.0',gitBase:'3a2f96c',status:'uncommitted working candidate',articleBaseline:'4733743',node:process.version,browser:{chromium:browser.version()},logicalCanvas:{width:1440,height:1000},scale:2,sourceHashes,parameters:{ring:{spread:.5,alpha:.12},near:{y:1,blur:2,spread:-1,alpha:.04},ambient:{y:3,blur:8,spread:-3,alpha:.02},image:{radius:12,inwardOutline:1,alpha:.10},numeric:{font:'Geist',size:23,tabular:true,kerning:'none',precision:2},dashboard:{outerRadius:24,innerRadius:16,inset:8,navRow:32,control:34,sectionGap:16,contentInset:24,checkbox:{markSize:11,radius:3,desktopTarget:32,mobileTarget:44},reportingPeriod:{width:212,height:34,radius:10,days:14},tableColumns:[4,28,17,19,7,10,15],avatars:{diameter:22,overlap:5,separator:1.5,innerWidth:.5,innerAlpha:.06,hostToken:'--avatar-host-surface',order:'last-on-top'}}},artifacts};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const thumbs=await Promise.all(artifacts.map(async(a,i)=>({input:await sharp(resolve(root,a.png)).resize(480,333).toBuffer(),left:(i%2)*480,top:Math.floor(i/2)*333})));
 await sharp({create:{width:960,height:999,channels:3,background:'#ececed'}}).composite(thumbs).png().toFile(resolve(out,'overview.png'));
 console.log(`Exported ${artifacts.length} original plates at 2880×2000; source hashes saved.`);
}finally{await browser.close();server.close();}
