import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect } from '@playwright/test'

export async function verifyExpansion(browser, {origin,engine,artifacts}) {
 const directory=resolve(artifacts,'expansion');await mkdir(directory,{recursive:true})
 const checks=[],captures=[],errors=[]
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'})
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000)
 const goto=async path=>{await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready)}
 const study=name=>page.locator(`[data-study="${name}"]`)
 const click=async(s,name)=>s.getByRole('button',{name,exact:true}).click()
 const insetBounds=async s=>s.locator('.inset-shell').evaluate(el=>{const shell=el.getBoundingClientRect(),button=el.querySelector('button').getBoundingClientRect(),css=getComputedStyle(el),border=parseFloat(css.borderTopWidth)||0;return {top:button.top-shell.top-border,bottom:shell.bottom-button.bottom-border,end:css.direction==='rtl'?button.left-shell.left-border:shell.right-button.right-border}})
 try {
  await goto('/craft/geometry');let s=study('inset');await expect(s.getByLabel('Even end gap')).toBeEnabled()
  let bounds=await insetBounds(s);assert(Math.abs(bounds.end-8)<.1);assert(Math.abs(bounds.top-4)<.1)
  const isEven=b=>Math.abs(b.top-b.bottom)<.1&&Math.abs(b.top-b.end)<.1
  assert(!isEven(bounds),'Negative specimen must be detected')
  await s.getByLabel('Even end gap').check();assert(isEven(await insetBounds(s)))
  await s.getByLabel('RTL specimen').check();assert(isEven(await insetBounds(s)))
  await s.getByLabel('Add 1px shell border and .5px action ring').check();assert(isEven(await insetBounds(s)))
  await click(s,'Clear inset field');await expect(s.getByRole('textbox',{name:'Inset field'})).toHaveValue('')
  await click(s,'Reset inset');await expect(s.getByLabel('Even end gap')).not.toBeChecked()
  checks.push('E01: 4/4/8 defect detected, 4/4/4 verified in LTR/RTL and border/ring mode; real clear/reset')

  await goto('/foundations/spacing')
  const spacing=await page.locator('.df-nested-cards').evaluate(el=>({gap:getComputedStyle(el).gap,padding:getComputedStyle(el.firstElementChild).padding,inner:getComputedStyle(el.firstElementChild).gap}))
  assert.deepEqual(spacing,{gap:'12px',padding:'24px',inner:'8px'})
  checks.push('E02: distinct 8px sibling, 24px enclosure and 12px external relationships rendered')
  await goto('/craft/typography');s=study('alignment')
  const balanced=s.locator('.alignment-rows>div').nth(1).locator('.alignment-pair')
  const geometry=()=>balanced.evaluate(el=>{const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x-p.x,y:r.y-p.y}});const baseline=await geometry();await s.getByLabel('Local correction').check();assert.deepEqual(await geometry(),baseline)
  await expect(s.locator('svg').first()).toHaveCSS('transform','matrix(1, 0, 0, 1, 1, 0)')
  await s.getByLabel('RTL pairing').check();await s.getByLabel('Trailing icon').check()
  assert.equal(await s.locator('.alignment-pair').last().evaluate(el=>getComputedStyle(el).paddingInlineEnd),'12px')
  checks.push('E03: scoped glyph shift, balanced control unchanged, trailing logical-side correction in RTL')
  await goto('/foundations/typography');s=study('measure')
  const before=await s.locator('.measure-passage').textContent();await s.getByLabel('Prose measure').selectOption('30');const short=await s.locator('.measure-passage').boundingBox();await s.getByLabel('Prose measure').selectOption('100');const long=await s.locator('.measure-passage').boundingBox();assert(short.width<long.width);assert.equal(await s.locator('.measure-passage').textContent(),before)
  await s.getByLabel('Passage').selectOption('zh-Hant');await expect(s.locator('article')).toHaveAttribute('lang','zh-Hant')
  await s.getByLabel('Line height').selectOption('2');assert.equal(await s.locator('article').evaluate(el=>parseFloat(getComputedStyle(el).lineHeight)/parseFloat(getComputedStyle(el).fontSize)),2)
  checks.push('E04: identical actual prose changes measure independently of line height; CJK passage retained')
  await goto('/craft/evidence');s=study('hierarchy');await s.getByLabel('Blur specimen only').check();await expect(s.locator('.hierarchy-sample')).toHaveCSS('filter','blur(3px)');assert.equal(await s.getByLabel('Blur specimen only').evaluate(el=>getComputedStyle(el).filter),'none')
  await goto('/craft/images');s=study('image-text');await s.getByLabel('Alternate crop').check();await expect(s.locator('p.backing')).toBeVisible()
  await goto('/foundations/data-visualization');s=study('encoding');const tones=await s.locator('.encoding-track>span').evaluateAll(els=>els.map(el=>getComputedStyle(el).opacity));await click(s,'Reverse records');assert.deepEqual(await s.locator('.encoding-track>span').evaluateAll(els=>els.map(el=>getComputedStyle(el).opacity)),tones.reverse())
  await s.getByLabel('Encoding').selectOption('diverging');assert.equal(await s.locator('.encoding-track.diverging').count(),3);await s.getByLabel('Missing B value').check();await expect(s).toContainText('Missing');assert.equal(await s.locator('[data-category=B]').count(),0);await s.getByLabel('One category').check();await expect(s.locator('li')).toHaveCount(1)
  checks.push('E05: blur excludes controls; crop retains backing; category identity survives reorder; diverging, missing and one-category states remain labeled')
  await goto('/foundations/sizing');const density=page.locator('[data-lab=density]');await density.getByLabel('Compare coordinated visible growth').check();await density.getByRole('slider',{name:'Target size'}).fill('56');assert.equal(await density.locator('.coordinated-controls .btn').evaluate(el=>el.getBoundingClientRect().height),56)
  assert.equal(await density.locator('.lab-target-mark').first().evaluate(el=>el.getBoundingClientRect().height),16)
  checks.push('E06: coordinated visible growth and preserved 16px marks coexist')

  await goto('/craft/focus');s=study('interaction');const help=s.getByRole('button',{name:'About local storage'});await help.focus();await expect(s.locator('.help-popup')).toBeVisible();await page.keyboard.press('Escape');await expect(s.locator('.help-popup')).toHaveCount(0);await expect(help).toBeFocused()
  await help.hover();await s.locator('.help-popup').hover();await expect(s.locator('.help-popup')).toBeVisible();await click(s,'Dismiss help');await expect(help).toBeFocused();await expect(s.locator('.help-popup')).toHaveCount(0)
  await s.getByText('Show editable details',{exact:true}).click();await s.getByLabel('Enable n while focus is in this specimen, outside fields').check();await s.getByLabel('Detail note').fill('');await s.getByLabel('Detail note').press('n');await expect(s).toContainText('Notes created: 0')
  await s.getByLabel('Detail note').dispatchEvent('compositionstart');await s.getByLabel('Detail note').press('n');await s.getByLabel('Detail note').dispatchEvent('compositionend');await expect(s).toContainText('Notes created: 0')
  const create=s.getByRole('button',{name:'Create local note'});await create.focus();await page.keyboard.press('n');await expect(s).toContainText('Notes created: 1')
  const move=s.getByRole('button',{name:'Move Field notes down'});await move.click();await expect(s.locator('.move-list li').nth(1)).toContainText('Field notes');await expect(move).toBeFocused();await move.press('Enter');await expect(s.locator('.move-list li').last()).toContainText('Field notes')
  checks.push('E07: Escape/dismiss restore trigger, popup pointer travel, text/IME shortcut exclusion, pointer and keyboard reorder with stable focus')

  await goto('/patterns/date-time');s=study('branch');await s.getByLabel('Remembered date').fill('2027-02-29');await s.getByLabel('Exact quantity').fill('21');await click(s,'Review branch request');await expect(s.locator('.study-summary')).toBeFocused();await expect(s.getByLabel('Exact quantity')).toHaveValue('21')
  await s.getByLabel('Remembered date').fill('1990-06-15');await s.getByLabel('Exact quantity').fill('2');await s.getByLabel('Display time zone').selectOption('UTC');await expect(s).toContainText('02:00 UTC');await expect(s.getByLabel('Remembered date')).toHaveValue('1990-06-15')
  await s.getByLabel('Available appointment').selectOption('2027-03-11');await click(s,'Review branch request');await expect(s.locator('.study-summary')).toContainText('checkout day after');await s.getByLabel('Range end').selectOption('2027-03-12');assert(await s.locator('option[value="2027-03-10"]').evaluate(option=>option.disabled && option.matches(':disabled')));await s.getByLabel('Available appointment').focus();await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');assert.notEqual(await s.getByLabel('Available appointment').inputValue(),'2027-03-10')
  await s.getByLabel('Delivery').selectOption('collect');await click(s,'Review branch request');assert(!(await s.locator('dl').innerText()).includes('12 Example Lane'));await click(s,'Change branch details');await s.getByLabel('Delivery').selectOption('post');await expect(s.getByLabel('Postal address')).toHaveValue('12 Example Lane');await s.getByLabel('Exact quantity').press('Enter');await click(s,'Submit branch request');await expect(s.getByRole('status')).toContainText('failure');await click(s,'Submit branch request');await expect(s.getByRole('status')).toContainText('Confirmed locally')
  checks.push('E08: invalid date/quantity retained, zone preserves civil date, invalid range corrected and unavailable date explained, hidden branch excluded/recoverable, Enter/review/failure/retry')

  await goto('/patterns/large-collections');s=study('large-collection');await s.getByLabel('Select Research note 01',{exact:true}).check();await s.getByLabel('Fail next chunk').check();await click(s,'Next page');await expect(s.locator('li')).toHaveCount(6);await expect(s.getByRole('status')).toContainText('failed');await click(s,'Next page');assert.equal(new URL(page.url()).searchParams.get('collection-page'),'2');await expect(s).toContainText('1 selected across')
  await s.getByRole('link',{name:'Research note 07',exact:true}).click();await expect(s.locator('article h4')).toBeFocused();await page.goBack();await expect(s.getByRole('link',{name:'Research note 07',exact:true})).toBeFocused()
  await s.getByLabel('Retrieval').selectOption('append');await s.getByLabel('Fail next chunk').check();await click(s,'Load more records');await expect(s.locator('li')).toHaveCount(6);await click(s,'Load more records');await expect(s.locator('li')).toHaveCount(12);await s.getByLabel('Fail optional summary').check();await expect(s.locator('li')).toHaveCount(12);await click(s,'Retry optional summary');await expect(s.getByLabel('Fail optional summary')).not.toBeChecked()
  await s.getByLabel('Retrieval').selectOption('page');await click(s,'Next page');await click(s,'Next page');await click(s,'Next page');for(let i=19;i<=24;i++)await click(s,`Remove Research note ${i}`);await expect(s).toContainText('Page 3 of 3');await expect(s.locator('li')).toHaveCount(6)
  checks.push('E09: failure retains records/selection, retry unique append, URL/Back/focus restoration, regional recovery, last-page deletion')

  await goto('/patterns/privacy');s=study('sharing');await s.getByLabel('Draft audience').selectOption('Anyone with the link');await click(s,'Cancel audience change');await expect(s.getByLabel('Draft audience')).toHaveValue('Private');await s.getByLabel('Draft audience').selectOption('Anyone with the link');await click(s,'Apply audience');await expect(s.locator('[data-audience]')).toHaveText('Private');await click(s,'Apply audience');await expect(s.locator('[data-audience]')).toHaveText('Anyone with the link');await click(s,'Copy example link');await expect(s.locator('[data-audience]')).toHaveText('Anyone with the link');await click(s,'Prepare revocation');await expect(s.locator('[data-audience]')).toHaveText('Anyone with the link');await click(s,'Apply audience');await expect(s.locator('[data-audience]')).toHaveText('Private')
  checks.push('E10: cancel/failure preserve confirmed audience; copy is independent; revocation requires successful apply')
  await goto('/patterns/ai');s=study('ai');await click(s,'Start or retry suggestion');await click(s,'Advance partial output');await click(s,'Stop generation');await expect(s.locator('[data-suggestion]')).toContainText('Begin with');await expect(s.getByLabel('Original text')).toHaveValue('A useful place to begin.');await click(s,'Start or retry suggestion');await click(s,'Resolve newest request');await click(s,'Accept suggestion');await click(s,'Resolve oldest request');await expect(s.getByLabel('Original text')).toHaveValue('Begin with the reader’s question and a clear next action.');await click(s,'Undo acceptance');await click(s,'Start or retry suggestion');await s.getByLabel('Original text').fill('Newer manual work');await click(s,'Resolve oldest request');await expect(s.getByLabel('Original text')).toHaveValue('Newer manual work');await expect(s.getByRole('button',{name:'Accept suggestion'})).toBeDisabled();await click(s,'Discard suggestion')
  checks.push('E11: stop retains partial, acceptance is explicit, stale callbacks cannot replace newer edits, undo/discard retain work')
  await goto('/foundations/media');s=study('timing');await s.getByLabel('Retained draft').fill('Keep me');await click(s,'Advance clock 40 seconds');await expect(s).toContainText('20 seconds to extend');for(let i=0;i<10;i++)await click(s,'Extend session');await expect(s).toContainText('Extensions: 10');await click(s,'Pause updates');await click(s,'Deliver one update');await expect(s).toContainText('Updates delivered: 0');await click(s,'Advance clock 40 seconds');await click(s,'Advance clock 40 seconds');await expect(s.getByLabel('Retained draft')).toHaveValue('Keep me');await click(s,'Resume session');await click(s,'Next slide');await expect(s).toContainText('Slide 2 of 3')
  checks.push('E12: warning/ten extensions, draft after expiry, independent paused updates, manual slide controls')

  await goto('/components/disclosure');s=study('controls');await click(s,'Inspect submitted fields');await expect(s.getByRole('status')).toHaveText('{"reference":"REF-024"}');await s.getByRole('button',{name:'Run local operation'}).focus();await page.keyboard.press('Enter');await expect(s.getByRole('status')).toHaveText('{"reference":"REF-024"}');await s.getByLabel('Mark local operation ARIA-disabled').uncheck();await click(s,'Run local operation');await click(s,'Resolve operation')
  const tab=s.getByRole('tab',{name:'Overview'});await tab.focus();await page.keyboard.press('ArrowRight');await expect(s.getByRole('tab',{name:'Details'})).toBeFocused();await expect(tab).toHaveAttribute('aria-selected','true');await page.keyboard.press('Enter');await expect(s).toContainText('Details pending');await click(s,'Resolve delayed panel');await s.getByRole('tab',{name:'Overview'}).click();await expect(s.getByLabel('Overview edit')).toHaveValue('Retained tab edit');await click(s,'Remove Maya');await expect(s.getByRole('button',{name:'Review selected people'})).toBeFocused();await click(s,'Pin card locally');await expect(s.getByRole('status')).toContainText('no navigation')
  checks.push('C04–C07: separate actions, manual delayed tabs, token removal focus, card action, native/ARIA-disabled/read-only contracts')
  assert.deepEqual(errors,[])
 } finally {await page.close()}
 // Inspect relevant native densities without resizing the captures.
 for(const density of [1,1.25,2]){
  const native=await browser.newPage({viewport:{width:900,height:900},deviceScaleFactor:density})
  for(const [path,name] of [['/craft/geometry','inset'],['/craft/typography','alignment']]){
   await native.goto(origin+path);await native.evaluate(()=>document.fonts.ready)
   const file=`${engine}-${density}-${name}.png`;await native.locator(`[data-study=${name}]`).screenshot({path:resolve(directory,file)});captures.push(file)
  }await native.close()
 }
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true})
 await touch.goto(origin+'/craft/focus');const interaction=touch.locator('[data-study=interaction]');await interaction.getByRole('button',{name:'About local storage'}).tap();await expect(interaction.locator('.help-popup')).toBeVisible();await interaction.getByRole('button',{name:'Move Field notes down'}).tap();await expect(interaction.locator('.move-list li').nth(1)).toContainText('Field notes');await touch.close()
 checks.push('Emulated first-touch help/reorder; native geometry captures at 1×, 1.25× and 2×')
 // Progressive enhancement and text growth are independent of task-state assertions.
 const staticPage=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:900}})
 for(const path of ['/patterns/date-time','/patterns/large-collections','/patterns/privacy','/patterns/ai','/foundations/media','/components/disclosure']){
  await staticPage.goto(origin+path)
  for(const control of await staticPage.locator('.task-study input,.task-study select,.task-study textarea,.task-study button').all())assert(await control.isDisabled(),`${path}: unhydrated enhanced control`)
  assert((await staticPage.locator('noscript').allTextContents()).join('').length>20)
 }
 await staticPage.close();checks.push('New conditional routes retain readable no-JavaScript content and disabled enhancement controls')
 const enlarged=await browser.newPage({viewport:{width:320,height:900}})
 for(const [path,name] of [['/foundations/typography','measure'],['/patterns/date-time','branch'],['/patterns/ai','ai'],['/patterns/privacy','sharing']]){
  await enlarged.goto(origin+path)
  await enlarged.addStyleTag({content:'.task-study{font-size:200%}.task-study p{line-height:1.5!important;margin-bottom:2em!important;letter-spacing:.12em!important;word-spacing:.16em!important}'})
  assert(await enlarged.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path}: enlarged text overflow`)
  const file=`${engine}-320-text-growth-${name}.png`;await enlarged.locator(`[data-study=${name}]`).screenshot({path:resolve(directory,file)});captures.push(file)
 }
 await enlarged.close();checks.push('Representative new tasks: 320px with doubled specimen text and spacing overrides; not browser zoom')
 const fallback=await browser.newPage({viewport:{width:390,height:900}});let abortedFonts=0
 await fallback.route(/\.woff2?(?:\?|$)/,route=>{abortedFonts++;return route.abort()})
 await fallback.goto(origin+'/foundations/typography');await expect(fallback.locator('[data-study=measure] article')).toBeVisible()
 assert(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 await fallback.close();checks.push(`Font-resource failure fallback: ${abortedFonts} requests interrupted; passage remained readable in layout (no optical equivalence claim)`)
 const report={engine,version:browser.version(),checks,captures,screenReader:'Not run: no real AT speech walkthrough available.',physicalDevice:'Not run: Playwright touch is emulation.'}
 await writeFile(resolve(directory,`${engine}.json`),JSON.stringify(report,null,2)+'\n');return report
}
