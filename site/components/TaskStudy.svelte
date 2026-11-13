<script lang="ts">
  import ReadingStudy from './studies/ReadingStudy.svelte'
  import ServiceStudy from './studies/ServiceStudy.svelte'
  import WorkspaceStudy from './studies/WorkspaceStudy.svelte'
  import '../styles/studies.css'
  let { kind }: { kind: string } = $props()
</script>
{#if kind === 'reading'}<ReadingStudy />{:else if kind === 'service'}<ServiceStudy />{:else if kind === 'workspace'}<WorkspaceStudy />{/if}
