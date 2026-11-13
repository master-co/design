<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { initialRecords, archiveRecords } from '../../studies/model.mjs'
  const uid = $props.id()
  let mounted = $state(false), records = $state(initialRecords()), query = $state(''), show = $state('Active'), order = $state('ascending')
  let selected = $state<string[]>([]), failed = $state<string[]>([]), completed = $state<string[]>([]), undo = $state<string[]>([])
  let failOne = $state(true), editId = $state(''), draft = $state(''), message = $state('Select visible records to operate on them.'), editError = $state('')
  let allBox = $state<HTMLInputElement>()
  const visible = $derived(records.filter(record => (show === 'All' || record.status === show) && `${record.name} ${record.owner}`.toLocaleLowerCase('en').includes(query.toLocaleLowerCase('en'))).sort((a, b) => order === 'ascending' ? a.name.localeCompare(b.name, 'en') : b.name.localeCompare(a.name, 'en')))
  const selectable = $derived(visible.filter(record => record.status === 'Active'))
  const allSelected = $derived(selectable.length > 0 && selectable.every(record => selected.includes(record.id)))
  $effect(() => { if (allBox) allBox.indeterminate = selected.length > 0 && !allSelected })
  onMount(() => { mounted = true })
  function criteria() { const had = selected.length; selected = []; message = had ? 'Criteria changed. Selection cleared; it always covers visible active records.' : 'Criteria changed. Selection covers visible active records.' }
  function select(id: string, checked: boolean) { selected = checked ? [...new Set([...selected, id])] : selected.filter(value => value !== id) }
  async function archive(retry = false) {
    const ids = retry ? [...failed] : [...selected]
    if (!ids.length) return
    const failure = !retry && failOne ? ids.at(-1)! : ''
    const result = archiveRecords(records, ids, failure)
    records = result.records; failed = result.failed; completed = retry ? [...completed, ...result.completed] : result.completed
    undo = retry ? [...undo, ...result.completed] : result.completed
    selected = []; failOne = false
    message = `${result.completed.length} archived in this operation; ${failed.length} failed. ${retry ? 'Only failed records were retried.' : 'Successful records will not be retried.'}`
    await tick(); document.getElementById(`${uid}-outcome`)?.focus()
  }
  async function restore() {
    const count = undo.length
    records = records.map(record => undo.includes(record.id) ? { ...record, status: 'Active' } : record)
    undo = []; completed = []; failed = []; selected = []; message = `Restored ${count} records from the latest batch.`
    await tick(); document.getElementById(`${uid}-outcome`)?.focus()
  }
  async function edit(id: string) { editId = id; draft = records.find(record => record.id === id)!.name; editError = ''; await tick(); document.getElementById(`${uid}-draft`)?.focus() }
  async function finish(save: boolean) {
    if (save && !draft.trim()) { editError = 'Enter a project name.'; return }
    const id = editId
    if (save) records = records.map(record => record.id === id ? { ...record, name: draft.trim() } : record)
    message = save ? 'Project name saved locally.' : 'Edit cancelled. The confirmed name is unchanged.'
    editId = ''; draft = ''; editError = ''; await tick()
    const target = document.getElementById(`${uid}-edit-${id}`) || document.getElementById(`${uid}-outcome`); target?.focus()
  }
  function reset() { records = initialRecords(); query = ''; show = 'Active'; order = 'ascending'; selected = []; failed = []; completed = []; undo = []; editId = draft = editError = ''; failOne = true; message = 'Workspace reset. All four records are active.' }
</script>

<section class="task-study" data-study="workspace" aria-label="Manage a local collection">
  <p class="study-intro">Fictional records; changes reset on reload. Selection covers visible active records and clears when filters change. Undo restores the latest archive batch.</p>
  <fieldset disabled={!mounted || !!editId}><legend class="study-sr">Collection controls</legend><div class="study-controls"><label>Find projects <input class="input" type="search" bind:value={query} oninput={criteria} /></label><label>Show records <select class="select" bind:value={show} onchange={criteria}><option>Active</option><option>Archived</option><option>All</option></select></label><label class="check"><input class="checkbox" type="checkbox" bind:checked={failOne} /> Fail the last selected record once</label></div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The named overflowing table region needs keyboard scrolling.) -->
    <div class="study-table-scroll" tabindex="0" role="region" aria-label="Project comparison table"><table class="study-table"><caption>{visible.length} visible / {records.length} total records · {selected.length} selected</caption><thead><tr><th><input bind:this={allBox} class="checkbox" type="checkbox" aria-label="Select all visible active projects" checked={allSelected} disabled={!selectable.length} onchange={event => { selected = event.currentTarget.checked ? selectable.map(record => record.id) : [] }} /></th><th aria-sort={order === 'ascending' ? 'ascending' : 'descending'}><button type="button" class="btn" onclick={() => order = order === 'ascending' ? 'descending' : 'ascending'}>Project {order === 'ascending' ? '↑' : '↓'}</button></th><th>Owner</th><th>Status</th><th>Action</th></tr></thead><tbody>{#each visible as record (record.id)}<tr><td><input class="checkbox" type="checkbox" aria-label={`Select ${record.name}`} checked={selected.includes(record.id)} disabled={record.status !== 'Active'} onchange={event => select(record.id, event.currentTarget.checked)} /></td><td>{record.name}</td><td>{record.owner}</td><td>{record.status}</td><td><button id={`${uid}-edit-${record.id}`} type="button" class="btn" aria-label={`Edit ${record.name}`} onclick={() => edit(record.id)}>Edit</button></td></tr>{/each}</tbody></table></div>
    {#if !visible.length}<p>No matching records. Change the criteria; the collection may still contain records.</p>{/if}
    <div class="study-actions"><button class="btn btn-primary" type="button" disabled={!selected.length} onclick={() => archive()}>Archive {selected.length} selected</button><button class="btn" type="button" disabled={!failed.length} onclick={() => archive(true)}>Retry {failed.length} failed</button><button class="btn" type="button" disabled={!undo.length} onclick={restore}>Undo latest archive</button></div>
  </fieldset>
  {#if editId}<form class="study-edit" onsubmit={event => { event.preventDefault(); finish(true) }}><label class="study-field" for={`${uid}-draft`}>Project name <input class="input" id={`${uid}-draft`} bind:value={draft} aria-invalid={editError ? 'true' : undefined} aria-describedby={editError ? `${uid}-edit-error` : undefined} /></label>{#if editError}<p class="study-error" id={`${uid}-edit-error`}>{editError}</p>{/if}<div class="study-actions"><button type="submit" class="btn btn-primary">Save project name</button><button type="button" class="btn" onclick={() => finish(false)}>Cancel edit</button></div></form>{/if}
  <div id={`${uid}-outcome`} tabindex="-1"><p class="study-output" role="status">{message}</p>{#if completed.length}<p>Completed: {records.filter(record => completed.includes(record.id)).map(record => record.name).join(', ')}</p>{/if}{#if failed.length}<p>Failed, available to retry: {records.filter(record => failed.includes(record.id)).map(record => record.name).join(', ')}</p>{/if}</div>
  <button class="btn study-reset" type="button" disabled={!mounted || !!editId} onclick={reset}>Reset workspace</button>
  <noscript><p>The initial records remain readable. Editing, selection and simulated batch operations require JavaScript.</p></noscript>
</section>
