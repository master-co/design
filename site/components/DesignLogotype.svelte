<script lang="ts" module>
  import clsx from 'clsx'
  import logotypeAtDark from '../../assets/brand/logo/master-design-horizontal-on-dark.svg?raw'
  import logotypeAtLight from '../../assets/brand/logo/master-design-horizontal-on-light.svg?raw'

  const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

  /**
   * The sibling Master logotypes share a 130.25-unit box from cap top to just below the baseline.
   * This artwork's box also holds the descender of “g”, which would shrink it at the same height;
   * crop to the shared box and let the descender overflow so the mark and type render at the same size.
   */
  const sharedBox = { viewBox: '0 -128 846.83 130.25', overflow: 'visible' }
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  type Props = SVGAttributes<SVGSVGElement>

  /** The Master Design logotype in both modes; the page's mode shows one. Attributes apply to the `<svg>` of each. */
  let { class: className, ...props }: Props = $props()
  const instanceId = $props.id()

  /** Attributes added at the start of the artwork's `<svg>` tag win over its own. */
  function render(source: string, modeClass: string, mode: string) {
    const attributes = Object.entries({ ...sharedBox, ...props, class: clsx(className, modeClass) })
      .filter(([, value]) => value != null && value !== false)
      .map(([name, value]) => ` ${name}="${escapeAttribute(String(value))}"`)
      .join('')
    return source
      .replace(/(\sid="|url\(#|href="#)/g, `$1${instanceId}-${mode}-`)
      .replace(/<svg\b/, `<svg${attributes}`)
  }
</script>

<!-- Both artworks share gradient ids, so each mode and instance gets its own prefix. -->
{@html render(logotypeAtDark, 'hidden@apply(--site-light)', 'dark')}
{@html render(logotypeAtLight, 'hidden@apply(--site-dark)', 'light')}
