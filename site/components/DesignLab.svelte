<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { compositeGray, contrastGray, circularInset, initialRequestState, requestTransition } from '../studies/model.mjs'
  import '../styles/studies.css'
  let { kind }: { kind: string } = $props()
  const uid = $props.id()
  const titles: Record<string, string> = { color: 'Inspect a composited color pair', density: 'Measure the target independently', geometry: 'Inspect a circular inset', typography: 'Let real text change the layout', states: 'Keep selection and focus distinct', responsive: 'Recompose a reading region', async: 'Resolve requests out of order', motion: 'Reverse motion before it finishes' }
  let mounted = $state(false)
  let alpha = $state(.7), dark = $state(false)
  let target = $state(44), gap = $state(12), activations = $state(0)
  let outer = $state(24), inset = $state(8), ring = $state(.5)
  let long = $state(false), script = $state('en'), tabular = $state(true)
  let selected = $state(true), clipped = $state(false), activated = $state(false)
  let narrow = $state(false), rtl = $state(false)
  let request = $state(initialRequestState())
  let open = $state(false), reduce = $state(false), systemReduce = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  const background = $derived(dark ? 24 : 250)
  const ink = $derived(compositeGray(dark ? 255 : 0, background, alpha))
  const contrast = $derived(contrastGray(ink, background))
  const geometry = $derived(circularInset(outer, inset, ring))
  onMount(() => {
    mounted = true
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { systemReduce = media.matches }
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  })
  onDestroy(() => clearTimeout(timer))
  function reset() {
    clearTimeout(timer)
    alpha = .7; dark = false; target = 44; gap = 12; activations = 0
    outer = 24; inset = 8; ring = .5; long = false; script = 'en'; tabular = true
    selected = true; clipped = false; activated = false; narrow = false; rtl = false
    request = initialRequestState(); open = false; reduce = false
  }
  function send(type: string, name = '', id = 0) { request = requestTransition(request, { type, name, id }) }
  function reverse() { clearTimeout(timer); open = true; timer = setTimeout(() => { open = false }, 180) }
</script>

<section class="design-lab" data-lab={kind} aria-label={titles[kind]}>
  <p class="study-intro">Change one relationship and inspect the result. Values belong to this local teaching specimen.</p>
  <fieldset disabled={!mounted}>
    <legend class="study-sr">Experiment controls</legend>
    {#if kind === 'color'}
      <div class="study-controls"><label>Text opacity <input class="slider" type="range" min="0" max="1" step="0.05" bind:value={alpha} /><output aria-live="off">{alpha.toFixed(2)}</output></label><label class="check"><input class="checkbox" type="checkbox" bind:checked={dark} /> Dark specimen</label></div>
      <div class="lab-color" style:background={`rgb(${background} ${background} ${background})`} style:color={`rgb(${ink} ${ink} ${ink})`}><strong>Read the actual pair</strong><p>This text is composited against the surface below it.</p></div>
      <p class="study-output">Calculated contrast: <output aria-live="off">{contrast.toFixed(2)}:1</output>. {contrast >= 4.5 ? 'This pair meets the 4.5:1 normal-text threshold.' : 'This pair is below the 4.5:1 normal-text threshold.'} This does not certify the page.</p>
    {:else if kind === 'density'}
      <div class="study-controls"><label>Target size <input class="slider" type="range" min="24" max="56" step="4" bind:value={target} /><output aria-live="off">{target}px</output></label><label>Between-target gap <input class="slider" type="range" min="0" max="24" step="4" bind:value={gap} /><output aria-live="off">{gap}px</output></label></div>
      <div class="lab-targets" style:gap={`${gap}px`}>{#each ['Previous', 'Next'] as name}<button class="btn" style:width={`${target}px`} style:height={`${target}px`} style:min-width={`${target}px`} style:min-height={`${target}px`} style:padding="0" aria-label={`${name} specimen item`} onclick={() => activations++}><span class="lab-target-mark" aria-hidden="true">{name === 'Previous' ? '←' : '→'}</span></button>{/each}</div>
      <p class="study-output" role="status">16px visible marks; {target}px measured target intent; {gap}px gap. Activations: {activations}. Check rendered bounds, not declarations alone.</p>
    {:else if kind === 'geometry'}
      <div class="study-controls"><label>Outer circular radius <input class="slider" type="range" min="8" max="40" step="2" bind:value={outer} /><output aria-live="off">{outer}px</output></label><label>Inset <input class="slider" type="range" min="2" max="16" step="2" bind:value={inset} /><output aria-live="off">{inset}px</output></label><label>Outside ring <input class="slider" type="range" min="0" max="2" step="0.5" bind:value={ring} /><output aria-live="off">{ring}px</output></label></div>
      <div class="lab-geometry" style:border-radius={`${outer}px`} style:padding={`${inset}px`}><div style:border-radius={`${geometry.radius}px`} style:box-shadow={`0 0 0 ${ring}px currentColor`}>Native-size construction</div></div>
      <p class="study-output">Inner radius: <output aria-live="off">{geometry.radius}px</output>. Layout inset: {geometry.layoutGap}px. Straight painted gap: {geometry.paintedGap}px. {outer <= inset ? 'The circular inner radius has reached zero; do not use a negative radius.' : 'Circular corners with uniform inset; no intervening physical border.'}</p>
    {:else if kind === 'typography'}
      <div class="study-controls"><label>Sample language <select class="select" bind:value={script}><option value="en">English</option><option value="zh-Hant">繁體中文 + Latin</option><option value="ar">العربية + Latin</option></select></label><label class="check"><input class="checkbox" type="checkbox" bind:checked={long} /> Longer content</label><label class="check"><input class="checkbox" type="checkbox" bind:checked={tabular} /> Tabular figures</label></div>
      <div class="lab-type" lang={script} dir={script === 'ar' ? 'rtl' : 'ltr'}><strong>{script === 'en' ? (long ? 'A deliberately longer project title that must remain readable' : 'Field notes') : script === 'zh-Hant' ? (long ? '跨語系介面研究與長標題 · Field notes 2026' : '介面研究 · Field notes') : (long ? 'ملاحظات المشروع الطويلة مع نص إضافي · Field notes' : 'ملاحظات · Field notes')}</strong><p>{script === 'en' ? 'Let text wrap without hiding the next action.' : script === 'zh-Hant' ? '讓文字自然換行，保留完整內容與下一個操作。' : 'يبقى النص واضحًا مع الحفاظ على الإجراء التالي.'}</p><div class="lab-numbers" style:font-variant-numeric={tabular ? 'tabular-nums' : 'normal'}><span>1,240.50</span><span>82.00</span><span>9,508.12</span></div></div>
      <p class="study-output">Inspect the loaded font, wrapping and actual digit widths. A font may already use equal-width digits; the switch need not create a visible difference.</p>
    {:else if kind === 'states'}
      <div class="study-controls"><label class="check"><input class="checkbox" type="checkbox" bind:checked={clipped} /> Demonstrate focus clipping</label></div>
      <div class="lab-state-frame" class:clipped><button class="btn" aria-pressed={selected} onclick={() => { selected = !selected; activated = true }}>{selected ? '✓ Selected' : 'Not selected'} — Field notes</button></div>
      <p class="study-output" role="status">{activated ? 'Selection changed.' : 'Tab to the specimen button.'} Focus marks the next keyboard destination; the checkmark marks the persistent value. {clipped ? 'This intentionally clipped frame demonstrates a failure; turn it off to restore clearance.' : 'The frame reserves clearance for focus.'}</p>
    {:else if kind === 'responsive'}
      <div class="study-controls"><label class="check"><input class="checkbox" type="checkbox" bind:checked={narrow} /> Narrow reading region</label><label class="check"><input class="checkbox" type="checkbox" bind:checked={rtl} /> Right-to-left composition</label></div>
      <div class="lab-reading-frame" class:narrow dir={rtl ? 'rtl' : 'ltr'}><div class="lab-reading-layout"><nav aria-label="Specimen contents"><a href={`#${uid}-reading`}>Reading section</a><a href={`#${uid}-next`}>Next action</a></nav><article><h4 id={`${uid}-reading`}>Keep the task recognizable</h4><p>A reading region and its contents navigation can change composition without shrinking their text.</p><p>Long content grows in the document. The next action stays in the meaningful reading order.</p><a id={`${uid}-next`} href="/foundations/layout">Explore layout guidance →</a></article></div></div>
      <p class="study-output">The container decides when the regions stack. Follow a section link, then check that focus and the heading remain visible.</p>
    {:else if kind === 'async'}
      <div class="study-controls"><button class="btn" type="button" onclick={() => send('start', 'Draft A')}>Start A</button><button class="btn" type="button" onclick={() => send('start', 'Draft B')}>Start B</button><button class="btn" type="button" disabled={!request.current} onclick={() => send('advance')}>Advance one unit</button><button class="btn" type="button" disabled={!request.pending.length} onclick={() => send('resolve', '', request.pending[0].id)}>Resolve oldest</button><button class="btn" type="button" disabled={!request.pending.length} onclick={() => send('resolve', '', request.pending.at(-1)!.id)}>Resolve newest</button><button class="btn" type="button" disabled={!request.current} onclick={() => send('fail', '', request.current)}>Fail current</button><button class="btn" type="button" disabled={!request.current} onclick={() => send('cancel')}>Cancel current</button></div>
      <div class="lab-request"><p>Active request: <strong>{request.current || 'None'}</strong> · queued callbacks: {request.pending.map(item => item.id).join(', ') || 'None'}</p><label>Measured units <progress max="4" value={request.progress}></progress> {request.progress}/4</label><p>Confirmed result: <strong data-confirmed>{request.result || 'Nothing confirmed'}</strong></p></div>
      <p class="study-output" role="status">{request.status}</p><p class="study-intro">Start A, then B. Resolve newest, then oldest. B must remain confirmed. All responses here are manually controlled local simulations.</p>
    {:else if kind === 'motion'}
      <div class="study-controls"><button class="btn" type="button" aria-pressed={open} onclick={() => { clearTimeout(timer); open = !open }}>Toggle destination</button><button class="btn" type="button" onclick={reverse}>Reverse mid-flight</button><label class="check"><input class="checkbox" type="checkbox" bind:checked={reduce} /> Remove travel</label></div>
      <div class="lab-motion" class:reduced={reduce || systemReduce} class:open><span class="lab-motion-object" aria-hidden="true">●</span></div>
      <p class="study-output" role="status">Destination: {open ? 'End' : 'Start'}. {systemReduce ? 'System reduced motion is active.' : reduce ? 'Travel is removed for this specimen.' : 'A 600ms specimen transition reverses from its current position.'}</p>
    {/if}
    <button type="button" class="btn study-reset" onclick={reset}>Reset experiment</button>
  </fieldset>
  <noscript><p>The initial specimen and explanation remain available. Interactive controls require JavaScript.</p></noscript>
</section>
