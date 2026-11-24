import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateSearchPages } from '@master/internal-site/utils/search-pages'
import { transformMarkdownLinks } from '@master/internal-site/utils/markdown-links.ts'
import { pages, siteOrigin } from '../catalog.mjs'
import { metadataFor } from './content.mjs'
import { illustratedMarkdown, renderers, validateFigureCatalog } from './illustrations.mjs'

const site = fileURLToPath(new URL('../', import.meta.url))
const root = fileURLToPath(new URL('../../', import.meta.url))
const expected = new Set<string>()
const fullGuide: string[] = []
validateFigureCatalog(pages)
for (const renderer of Object.values(renderers)) await access(join(site, 'components', renderer))
async function write(file: string, value: string) {
  expected.add(file)
  if (await readFile(file, 'utf8').catch(() => '') === value) return
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, value)
}
for (const page of pages) {
  const markdown = await readFile(join(root, page.source), 'utf8')
  const directory = join(site, 'content', page.route === '/' ? '(home)' : page.route.slice(1))
  const componentPrefix = relative(directory, join(site, 'components')).split('\\').join('/')
  await write(join(directory, 'content.mdx'), illustratedMarkdown(markdown, page.source, componentPrefix))
  await write(join(directory, 'metadata.ts'), `// Generated from the portable skill. Edit site/catalog.mjs for route metadata.\nexport default ${JSON.stringify(metadataFor(page), null, 2)}\n`)
  await write(join(site, 'public', page.markdownPath), markdown)
  // Each source has its own base directory. Keep its links usable from the combined file.
  const markdownURL = new URL(page.markdownPath, siteOrigin)
  const body = transformMarkdownLinks(markdown, href => new URL(href, markdownURL).href)
  fullGuide.push(`[Read this page on Master Design](${new URL(page.route, siteOrigin).href})\n\n${body.trimEnd()}`)
}
// Remove adapters for deleted routes, never source Markdown.
for (const file of await readdir(join(site, 'content'), { recursive: true }).catch(() => [] as string[])) {
  const path = join(site, 'content', file)
  if (/\.(?:mdx|ts)$/.test(file) && !expected.has(path)) await rm(path)
}
for (const file of await readdir(join(site, 'public/guidelines'), { recursive: true }).catch(() => [] as string[])) {
  const path = join(site, 'public/guidelines', file)
  if (file.endsWith('.md') && !expected.has(path)) await rm(path)
}
const license = await readFile(join(root, 'skills/master-design/LICENSE.txt'), 'utf8')
await write(join(site, 'public/guidelines/LICENSE.txt'), license)
const groups = [...Map.groupBy(pages, page => page.category)]
const categories = groups.map(([name, entries]) => ({ name, pages: entries.map(metadataFor) }))
await write(join(site, '.categories/guide.json'), JSON.stringify(categories, null, 2) + '\n')
const sections = groups.map(([name, entries]) => [
  `## ${name}`,
  entries.map(page => `- [${page.documentTitle}](${new URL(page.markdownPath, siteOrigin).href}): ${page.description}`).join('\n'),
].join('\n\n'))
await write(join(site, 'public/llms.txt'), [
  '# Master Design',
  '> A practical guide to web interface design, accessibility and interaction. The portable master-design skill uses the same Markdown.',
  'Start with the decision you are making. Each topic links to a standalone Markdown document.',
  ...sections,
  '## Optional',
  `- [Complete guide](${siteOrigin}/llms-full.txt): All topics in one file, with links to the published pages.\n- [Markdown license](${siteOrigin}/guidelines/LICENSE.txt): MIT license for the guideline text.`,
].join('\n\n') + '\n')
await write(join(site, 'public/llms-full.txt'), ['# Master Design\n\nWeb interface design guidelines.', ...fullGuide, license.trimEnd()].join('\n\n---\n\n') + '\n')
await generateSearchPages({ cwd: site, defaultLocale: 'en', locales: ['en'], dictionariesDir: join(site, 'i18n'), write: true })
console.log(`Prepared ${pages.length} pages from ${relative(root, join(root, 'skills/master-design/references'))}.`)
