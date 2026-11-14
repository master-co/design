<script lang="ts">
 import { onMount } from 'svelte'
 let mounted=$state(false), correction=$state(false), rtl=$state(false), trailing=$state(false), guides=$state(true)
 onMount(()=>{mounted=true})
</script>
<section class="task-study" data-study="alignment" aria-label="Optical alignment comparison">
 <fieldset disabled={!mounted}><legend class="study-sr">Alignment controls</legend><div class="study-controls">
 {#each ['correction','rtl','trailing','guides'] as option}
 {#if option==='correction'}<label class="check"><input class="checkbox" type="checkbox" bind:checked={correction}/> Local correction</label>{:else if option==='rtl'}<label class="check"><input class="checkbox" type="checkbox" bind:checked={rtl}/> RTL pairing</label>{:else if option==='trailing'}<label class="check"><input class="checkbox" type="checkbox" bind:checked={trailing}/> Trailing icon</label>{:else}<label class="check"><input class="checkbox" type="checkbox" bind:checked={guides}/> Show box guides</label>{/if}{/each}</div>
 <div class="alignment-rows" dir={rtl?'rtl':'ltr'} class:guides>
 {#each ['Triangle','Balanced','Padded'] as shape}
 <div><span>{shape}</span><div class="alignment-pair" class:trailing style:padding-inline-start={correction&&shape==='Padded'&&!trailing?'12px':'16px'} style:padding-inline-end={correction&&shape==='Padded'&&trailing?'12px':'16px'}>
 <span class="ink-box"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style:transform={correction&&shape==='Triangle'?'translateX(1px)':'none'}>{#if shape==='Triangle'}<path d="M6 3L21 12L6 21Z" fill="currentColor"/>{:else if shape==='Balanced'}<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>{:else}<path d="M9 7H15V17H9Z" fill="currentColor"/>{/if}</svg></span><span class="ink-text">Agyp · <span lang="zh-Hant">文字</span></span></div></div>
 {/each}</div><p>Same font and 24px asset viewport. Balanced stays unchanged. The local 1px triangle shift and 12/16px padded pairing are comparison values, not universal corrections. The playback symbol is not automatically mirrored in RTL.</p>
 <button class="btn" onclick={()=>{correction=rtl=trailing=false;guides=true}}>Reset alignment</button></fieldset><noscript>Compare the visible boxes and glyphs; switches require JavaScript.</noscript>
</section>
<style>
.alignment-rows {display:grid;gap:16px}.alignment-rows>div{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}.alignment-pair{display:flex;align-items:center;gap:8px;min-height:44px;border:1px solid var(--color-line-divider);box-sizing:border-box}.alignment-pair.trailing{flex-direction:row-reverse}.ink-box{display:block;width:24px;height:24px;flex:none}.ink-text{line-height:1.5}.guides .ink-box,.guides .ink-text{outline:1px dashed var(--color-line-strong)}
</style>
