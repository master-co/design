<script lang="ts">
  import { onMount } from 'svelte'
  let mounted = $state(false), even = $state(false), rtl = $state(false), painted = $state(false), text = $state('Field notes')
  onMount(() => { mounted = true })
</script>
<section class="task-study" data-study="inset" aria-label="Embedded action inset">
  <fieldset disabled={!mounted}><legend class="study-sr">Inset controls</legend>
    <div class="study-controls"><label class="check"><input class="checkbox" type="checkbox" bind:checked={even} /> Even end gap</label><label class="check"><input class="checkbox" type="checkbox" bind:checked={rtl} /> RTL specimen</label><label class="check"><input class="checkbox" type="checkbox" bind:checked={painted} /> Add 1px shell border and .5px action ring</label></div>
    <div class="inset-shell" dir={rtl ? 'rtl' : 'ltr'} class:painted style:padding-inline-end={even ? '4px' : '8px'}><input aria-label="Inset field" bind:value={text} /><button type="button" class="btn" aria-label="Clear inset field" onclick={() => text = ''}>×</button></div>
    <p>Layout gaps: 4px above/below, {even ? 4 : 8}px at the end. {painted ? 'The shell border is outside the measured inner box; the ring reduces painted gaps by .5px.' : 'Borderless shell; compare painted action edges.'}</p>
    <div class="attached-shell"><span>Attached full-height action</span><button class="btn" type="button" onclick={() => text = 'Attached action used'}>Use</button></div><p>This attached action has a different intention; equal inset is not required.</p>
    <button class="btn" onclick={() => { even = rtl = painted = false; text = 'Field notes' }}>Reset inset</button>
  </fieldset><noscript>Inset comparisons remain visible; controls require JavaScript.</noscript>
</section>
<style>
.inset-shell {display:flex;align-items:center;gap:8px;background:var(--color-surface-inset);padding:4px 8px 4px 12px;border-radius:10px;box-sizing:content-box;min-width:0}
.inset-shell input {min-width:0;width:100%;background:transparent;border:0;font:inherit;height:32px;padding:0;color:inherit}
.inset-shell .btn {width:32px;height:32px;min-height:32px;min-width:32px;padding:0;border-radius:6px}
.inset-shell.painted {border:1px solid currentColor}.painted .btn {box-shadow:0 0 0 .5px currentColor}
.attached-shell {display:flex;align-items:stretch;background:var(--color-surface-inset);min-height:44px;gap:12px}.attached-shell span {padding:8px;flex:1}.attached-shell .btn {border-radius:0}
</style>
