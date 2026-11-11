<script lang="ts">
  let density = $state('comfortable')
  let name = $state('Field notes')
  let saved = $state('')
  const id = $props.id()
</script>

<form class="design-specimen" aria-label="Master UI foundation example" onsubmit={event => { event.preventDefault(); saved = `Saved “${name.trim()}” in this example.` }}>
  <fieldset>
    <legend>One task, two densities</legend>
    <label><input class="radio" type="radio" name={`${id}-density`} value="comfortable" bind:group={density} /> Comfortable</label>
    <label><input class="radio" type="radio" name={`${id}-density`} value="compact" bind:group={density} /> Compact</label>
  </fieldset>
  <label class="design-specimen-field" for={`${id}-name`}>
    Project name
    <input class:input-sm={density === 'compact'} class="input" id={`${id}-name`} type="text" bind:value={name} required maxlength="80" oninput={() => saved = ''} />
  </label>
  <button type="submit" class="btn btn-primary" class:btn-sm={density === 'compact'} disabled={!name.trim()}>Save changes</button>
  <p class="design-specimen-status" role="status">{saved || 'Try the controls. This example keeps changes in this page only.'}</p>
</form>
