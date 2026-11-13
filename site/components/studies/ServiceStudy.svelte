<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte'
  import { validateService } from '../../studies/model.mjs'
  const uid = $props.id()
  let mounted = $state(false), name = $state(''), email = $state(''), step = $state('entry')
  let errors = $state({ name: '', email: '' }), attempted = $state(false), fail = $state(true), message = $state(''), discard = $state(false)
  let heading = $state<HTMLHeadingElement>(), summary = $state<HTMLDivElement>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let version = 0
  onMount(() => { mounted = true })
  onDestroy(() => { version++; clearTimeout(timer) })
  async function review() {
    attempted = true; errors = validateService(name, email)
    if (errors.name || errors.email) { await tick(); summary?.focus(); return }
    step = 'review'; message = ''; await tick(); heading?.focus()
  }
  function correct() { if (attempted) errors = validateService(name, email) }
  async function edit() { step = 'entry'; message = ''; await tick(); document.getElementById(`${uid}-name`)?.focus() }
  function submit() {
    if (step === 'submitting') return
    const current = ++version
    const shouldFail = fail; fail = false
    step = 'submitting'; message = 'Submitting the reviewed draft locally…'
    timer = setTimeout(async () => {
      if (current !== version) return
      if (shouldFail) { step = 'failed'; message = 'Simulated submission failure. Your reviewed draft is kept; retry when ready.' }
      else { step = 'complete'; message = `Local confirmation created for ${name.trim()}. No message was sent.` }
      await tick(); if (step === 'complete') heading?.focus()
    }, 500)
  }
  async function reset() {
    version++; clearTimeout(timer); name = email = message = ''; step = 'entry'; attempted = discard = false; errors = { name: '', email: '' }; fail = true
    await tick(); document.getElementById(`${uid}-name`)?.focus()
  }
  async function requestReset() { if (step === 'complete' || (!name && !email)) await reset(); else { discard = true; await tick(); document.getElementById(`${uid}-keep`)?.focus() } }
</script>

<section class="task-study" data-study="service" aria-label="Complete a local request">
  <p class="study-intro">A fictional service request. Values live only in this page and reset on reload. The first submission fails deliberately; retry succeeds unless another failure is selected.</p>
  <h4 bind:this={heading} tabindex="-1">{step === 'entry' ? '1. Your details' : step === 'complete' ? '3. Request complete' : '2. Review your request'}</h4>
  {#if discard}<div class="study-summary" role="group" aria-label="Discard this local draft?"><p>Discard the entered name and email and start again?</p><div class="study-actions"><button id={`${uid}-keep`} class="btn" onclick={async () => { discard = false; await tick(); document.getElementById(`${uid}-reset`)?.focus() }}>Keep this draft</button><button class="btn" onclick={reset}>Discard draft</button></div></div>{/if}
  {#if step === 'entry'}
    <form novalidate onsubmit={event => { event.preventDefault(); review() }}>
      <fieldset disabled={!mounted}><legend class="study-sr">Contact details</legend>
        {#if errors.name || errors.email}<div class="study-summary" tabindex="-1" bind:this={summary}><p>Please correct the following:</p><ul>{#if errors.name}<li><a href={`#${uid}-name`} onclick={() => document.getElementById(`${uid}-name`)?.focus()}>{errors.name}</a></li>{/if}{#if errors.email}<li><a href={`#${uid}-email`} onclick={() => document.getElementById(`${uid}-email`)?.focus()}>{errors.email}</a></li>{/if}</ul></div>{/if}
        <label class="study-field" for={`${uid}-name`}>Your name <input id={`${uid}-name`} class="input" autocomplete="name" required bind:value={name} oninput={correct} aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? `${uid}-name-error` : undefined} />{#if errors.name}<span id={`${uid}-name-error`} class="study-error">{errors.name}</span>{/if}</label>
        <label class="study-field" for={`${uid}-email`}>Email address <input id={`${uid}-email`} class="input" type="email" autocomplete="email" required bind:value={email} oninput={correct} aria-invalid={errors.email ? 'true' : undefined} aria-describedby={`${uid}-email-help${errors.email ? ` ${uid}-email-error` : ''}`} /><small id={`${uid}-email-help`}>Used in the local confirmation. This example sends nothing.</small>{#if errors.email}<span id={`${uid}-email-error`} class="study-error">{errors.email}</span>{/if}</label>
        <button class="btn btn-primary" type="submit">Review request</button>
      </fieldset>
    </form>
  {:else if step === 'complete'}
    <p>Your local request is complete.</p><dl class="study-review"><dt>Name</dt><dd>{name.trim()}</dd><dt>Email</dt><dd>{email.trim()}</dd></dl><p>No server record or email was created.</p>
  {:else}
    <dl class="study-review"><dt>Name</dt><dd>{name.trim()}</dd><dt>Email</dt><dd>{email.trim()}</dd></dl>
    <fieldset disabled={step === 'submitting'}><legend class="study-sr">Review actions</legend><label class="check"><input class="checkbox" type="checkbox" bind:checked={fail} /> Fail the next local submission</label><div class="study-actions"><button class="btn" onclick={edit}>Change details</button><button class="btn btn-primary" onclick={submit}>{step === 'failed' ? 'Retry submission' : step === 'submitting' ? 'Submitting…' : 'Submit request'}</button></div></fieldset>
  {/if}
  <p class="study-output" role="status">{message}</p>
  <button id={`${uid}-reset`} class="btn study-reset" type="button" disabled={!mounted || step === 'submitting'} onclick={requestReset}>{step === 'complete' ? 'Start a new request' : 'Start over'}</button>
  <noscript><p>This walkthrough explains entry, review and recovery above. Interactive submission is unavailable without JavaScript.</p></noscript>
</section>
