import { dirname, resolve, relative } from 'node:path'
import { remark } from 'remark'
import gfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { pages } from '../catalog.mjs'
import legacyAnchors from '../legacy-anchors.json' with { type: 'json' }
import { createHeadingResolver } from '@master/internal-site/utils/resolve-heading.js'

const parser = remark().use(gfm).data('settings', { unsafe: [{ character: '{', inConstruct: 'phrasing' }, { character: '}', inConstruct: 'phrasing' }] })
const sourceRoutes = new Map(pages.map(page => [page.source, page.route]))

/** Adapt relative skill links at the syntax-tree level; code samples remain untouched. */
export function webMarkdown(markdown, source) {
  const tree = parser.parse(markdown)
  if (tree.children[0]?.type === 'heading' && tree.children[0].depth === 1) tree.children.shift()
  visit(tree, node => {
    if (!['link', 'image', 'definition'].includes(node.type) || !node.url || /^(?:[a-z]+:|\/|#)/i.test(node.url)) return
    const [target, hash] = node.url.split('#')
    const canonical = relative('/', resolve('/', dirname(source), decodeURIComponent(target)))
    const route = sourceRoutes.get(canonical)
    if (!route) throw new Error(`No public route for ${node.url} in ${source}`)
    node.url = route + (hash ? `#${hash}` : '')
  })
  const aliases = legacyAnchors.routes.flatMap(entry =>
    entry.destination && new URL(entry.destination).pathname === sourceRoutes.get(source)
      ? Object.entries(entry.aliases) : [])
  if (aliases.length) {
    const heading = createHeadingResolver()
    const targets = new Map()
    const text = node => node.value ?? node.children?.map(text).join('') ?? ''
    visit(tree, 'heading', node => targets.set(heading(text(node), node.depth).id, node))
    for (const [alias, target] of aliases) {
      if (!targets.has(target)) throw new Error(`Missing legacy anchor target ${target} in ${source}`)
      if (targets.has(alias)) throw new Error(`Legacy anchor ${alias} conflicts with a heading in ${source}`)
      const node = targets.get(target)
      tree.children.splice(tree.children.indexOf(node), 0, {
        type: 'html', value: `<span id="${alias}" class="design-legacy-anchor" data-legacy-target="${target}" aria-hidden="true"></span>`
      })
    }
  }
  return parser.stringify(tree)
}

export function metadataFor(page) {
  return {
    title: page.title,
    ...(page.route === '/' ? { other: { subject: 'Overview' } } : {}),
    description: page.description,
    category: page.category,
    pathname: page.route,
    sourcePath: page.source,
    alternates: { canonical: `https://design.master.co${page.route === '/' ? '' : page.route}` },
  }
}
