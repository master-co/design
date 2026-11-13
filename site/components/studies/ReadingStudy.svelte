<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { articles, searchArticles, readingURL } from '../../studies/model.mjs'
  const uid = $props.id()
  let mounted = $state(false), query = $state(''), category = $state('All'), active = $state(''), fail = $state(false), failed = $state(false), composing = $state(false)
  let appliedQuery = $state(''), appliedCategory = $state('All'), status = $state('Four local articles are available.')
  let heading = $state<HTMLHeadingElement>()
  const results = $derived(searchArticles(appliedQuery, appliedCategory))
  const article = $derived(articles.find(item => item.id === active))
  let initialTitle = ''
  function restore() {
    const url = new URL(location.href)
    query = appliedQuery = url.searchParams.get('q') || ''
    const value = url.searchParams.get('category') || 'All'
    category = appliedCategory = ['All', 'Content', 'Craft', 'Flows'].includes(value) ? value : 'All'
    const requested = url.searchParams.get('article') || ''
    active = articles.some(item => item.id === requested) ? requested : ''
    failed = false
    document.title = active ? `${articles.find(item => item.id === active)!.title} — Reading study` : initialTitle
    status = `${searchArticles(query, category).length} matching articles.`
  }
  onMount(() => {
    mounted = true; initialTitle = document.title; restore()
    const pop = async () => {
      const previous = active
      restore(); await tick()
      if (active) heading?.focus()
      else if (previous) document.getElementById(`${uid}-result-${previous}`)?.focus()
    }
    window.addEventListener('popstate', pop)
    return () => { window.removeEventListener('popstate', pop); document.title = initialTitle }
  })
  function search(retry = false) {
    if (composing) return
    appliedQuery = query; appliedCategory = category; active = ''
    if (!retry) history.pushState({ readingStudy: true }, '', readingURL(query, category))
    if (fail) { fail = false; failed = true; status = 'Simulated search failure. Your criteria are kept.' }
    else { failed = false; status = `${searchArticles(query, category).length} matching articles.` }
  }
  async function open(event: MouseEvent, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    history.replaceState({ ...history.state, readingStudy: true, fromResult: id }, '', location.href)
    history.pushState({ readingStudy: true, detail: true }, '', readingURL(appliedQuery, appliedCategory, id))
    active = id; document.title = `${articles.find(item => item.id === id)!.title} — Reading study`
    await tick(); heading?.focus()
  }
  async function back(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (history.state?.detail) history.back()
    else {
      const previous = active
      history.pushState({ readingStudy: true }, '', readingURL(appliedQuery, appliedCategory))
      active = ''; document.title = initialTitle; await tick()
      document.getElementById(`${uid}-result-${previous}`)?.focus()
    }
  }
  function reset() {
    query = appliedQuery = ''; category = appliedCategory = 'All'; active = ''; fail = failed = false
    history.pushState({ readingStudy: true }, '', readingURL('', 'All')); document.title = initialTitle; status = 'Reset. Four local articles are available.'
  }
</script>

<section class="task-study" data-study="reading" aria-label="Explore a local reading collection">
  <p class="study-intro">Four original teaching articles. Search failures are simulated locally; query and category are shareable in this page’s URL.</p>
  {#if article}
    <article class="study-article"><a href={readingURL(appliedQuery, appliedCategory)} onclick={back}>← Return to results</a><h4 bind:this={heading} tabindex="-1">{article.title}</h4><p>{article.summary}</p><nav aria-label="Article sections"><a href={`#${uid}-purpose`}>Purpose</a> · <a href={`#${uid}-practice`}>In practice</a></nav><h5 id={`${uid}-purpose`}>Purpose</h5><p>{article.body}</p><h5 id={`${uid}-practice`}>In practice</h5><p>{article.detail}</p><a href="/foundations/layout">Continue with layout guidance →</a></article>
  {:else}
    <form onsubmit={event => { event.preventDefault(); search() }}>
      <fieldset disabled={!mounted}><legend class="study-sr">Search local articles</legend><div class="study-controls"><label>Search articles <input class="input" type="search" bind:value={query} onkeydown={event => { if (event.key === 'Enter' && (event.isComposing || composing)) event.preventDefault() }} oncompositionstart={() => composing = true} oncompositionend={() => composing = false} /></label><label>Category <select class="select" bind:value={category}><option>All</option><option>Content</option><option>Craft</option><option>Flows</option></select></label><button type="submit" class="btn btn-primary">Search collection</button></div><label class="check"><input class="checkbox" type="checkbox" bind:checked={fail} /> Simulate failure on next search</label></fieldset>
    </form>
    <p class="study-output" role="status">{status}</p>
    {#if failed}<p>Your query and category are retained.</p><button class="btn" type="button" onclick={() => search(true)}>Retry search</button>
    {:else if !results.length}<p>No matching articles. Change the query or clear the criteria.</p><button class="btn" type="button" onclick={reset}>Clear criteria</button>
    {:else}<ul class="study-results">{#each results as result (result.id)}<li><span class="df-label">{result.category}</span><a id={`${uid}-result-${result.id}`} href={readingURL(appliedQuery, appliedCategory, result.id)} onclick={event => open(event, result.id)}>{result.title}</a><p>{result.summary}</p></li>{/each}</ul>{/if}
  {/if}
  <button class="btn study-reset" type="button" disabled={!mounted} onclick={reset}>Reset reading study</button>
  <noscript><p>Filtering needs JavaScript. The complete local articles remain readable below.</p>{#each articles as item}<article><h4>{item.title}</h4><p>{item.summary}</p><p>{item.body}</p><p>{item.detail}</p></article>{/each}</noscript>
</section>
