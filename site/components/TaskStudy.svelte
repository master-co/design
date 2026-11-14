<script lang="ts">
  import ReadingStudy from './studies/ReadingStudy.svelte'
  import ServiceStudy from './studies/ServiceStudy.svelte'
  import WorkspaceStudy from './studies/WorkspaceStudy.svelte'
  import InsetStudy from './studies/InsetStudy.svelte'
  import AlignmentStudy from './studies/AlignmentStudy.svelte'
  import MeasureStudy from './studies/MeasureStudy.svelte'
  import InteractionStudy from './studies/InteractionStudy.svelte'
  import BranchStudy from './studies/BranchStudy.svelte'
  import CollectionStudy from './studies/CollectionStudy.svelte'
  import SharingStudy from './studies/SharingStudy.svelte'
  import AiStudy from './studies/AiStudy.svelte'
  import TimingStudy from './studies/TimingStudy.svelte'
  import ControlStudy from './studies/ControlStudy.svelte'
  import MeaningStudy from './studies/MeaningStudy.svelte'
  import '../styles/studies.css'
  let { kind }: { kind: string } = $props()
</script>
{#if kind === 'reading'}<ReadingStudy />{:else if kind === 'service'}<ServiceStudy />{:else if kind === 'workspace'}<WorkspaceStudy />{/if}

{#if kind === 'inset'}<InsetStudy />{/if}
{#if kind === 'alignment'}<AlignmentStudy />{/if}
{#if kind === 'measure'}<MeasureStudy />{/if}
{#if kind === 'interaction'}<InteractionStudy />{/if}
{#if kind === 'branch'}<BranchStudy />{/if}
{#if kind === 'large-collection'}<CollectionStudy />{/if}
{#if kind === 'sharing'}<SharingStudy />{/if}
{#if kind === 'ai'}<AiStudy />{/if}
{#if kind === 'timing'}<TimingStudy />{/if}
{#if kind === 'controls'}<ControlStudy />{/if}
{#if ['hierarchy','image-text','encoding'].includes(kind)}<MeaningStudy {kind} />{/if}
