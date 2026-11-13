import { remark } from 'remark'
import gfm from 'remark-gfm'
import { figures, figuresFor } from '../figures/catalog.mjs'
import { webMarkdown } from './content.mjs'

export const renderers = {
  GuideFigure: 'GuideFigure.astro',
  StudyFrame: 'StudyFrame.astro',
  DesignLab: 'DesignLab.svelte',
  FoundationPreview: 'FoundationPreview.svelte',
  TaskStudy: 'TaskStudy.svelte',
}

export function validateFigureCatalog(pages, entries = figures) {
  const sources = new Set(pages.map(page => page.source))
  const ids = new Set()
  for (const entry of entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || ids.has(entry.id)) throw new Error(`Duplicate or invalid figure ID: ${entry.id}`)
    ids.add(entry.id)
    if (!sources.has(entry.source)) throw new Error(`Missing canonical figure source: ${entry.source}`)
    if (!entry.heading) throw new Error(`Missing figure section: ${entry.id}`)
    if (!Object.hasOwn(renderers, entry.component)) throw new Error(`Missing figure renderer: ${entry.component}`)
    if (entry.component === 'GuideFigure' && (!entry.title || !entry.caption || !entry.kind)) throw new Error(`Incomplete figure explanation: ${entry.id}`)
  }
}

/** Add site-only presentations after a canonical section without editing its prose. */
export function illustratedMarkdown(markdown, source, componentPrefix, entries = figuresFor(source)) {
  const canonical = webMarkdown(markdown, source)
  if (!entries.length) return canonical
  const tree = remark().use(gfm).parse(canonical)
  const text = node => node.value ?? node.children?.map(text).join('') ?? ''
  const insertions = new Map()
  const components = new Set()
  for (const entry of entries) {
    if (!Object.hasOwn(renderers, entry.component)) throw new Error(`Missing figure renderer: ${entry.component}`)
    const matches = tree.children.filter(node => node.type === 'heading' && text(node) === entry.heading)
    if (matches.length !== 1) throw new Error(`Figure ${entry.id}: expected one section "${entry.heading}" in ${source}, found ${matches.length}`)
    const heading = matches[0], index = tree.children.indexOf(heading)
    const next = tree.children.slice(index + 1).find(node => node.type === 'heading' && node.depth <= heading.depth)
    const position = next?.position.start.offset ?? canonical.length
    const component = entry.component === 'GuideFigure' ? 'GuideFigure' : 'StudyFrame'
    const invocation = `<${component} id="${entry.id}" />`
    insertions.set(position, [...(insertions.get(position) ?? []), invocation])
    components.add(component)
  }
  let result = canonical
  for (const [position, values] of [...insertions].sort(([a], [b]) => b - a)) {
    result = result.slice(0, position) + '\n' + values.join('\n\n') + '\n\n' + result.slice(position)
  }
  const imports = [...components].map(name => `import ${name} from '${componentPrefix}/${renderers[name]}'`).join('\n')
  return imports + '\n\n' + result
}
