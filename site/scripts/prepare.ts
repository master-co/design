import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateSearchPages } from '@master/internal-site/utils/search-pages'
import { pages } from '../catalog.mjs'
import { metadataFor, webMarkdown } from './content.mjs'

const site = fileURLToPath(new URL('../', import.meta.url))
const root = fileURLToPath(new URL('../../', import.meta.url))
const expected = new Set<string>()
async function write(file: string, value: string) {
  expected.add(file)
  if (await readFile(file, 'utf8').catch(() => '') === value) return
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, value)
}
for (const page of pages) {
  const markdown = await readFile(join(root, page.source), 'utf8')
  const directory = join(site, 'content', page.route === '/' ? '(home)' : page.route.slice(1))
  const specimen = page.route === '/foundations/sizing'
    ? `import FoundationPreview from '../../../components/FoundationPreview.svelte'\n\n<FoundationPreview client:load />\n\n`
    : ''
  await write(join(directory, 'content.mdx'), specimen + webMarkdown(markdown, page.source))
  await write(join(directory, 'metadata.ts'), `// Generated from the portable skill. Edit site/catalog.mjs for route metadata.\nexport default ${JSON.stringify(metadataFor(page), null, 2)}\n`)
  await write(join(site, 'public/guidelines', page.source.replace('skills/master-design/references/', '')), markdown)
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
const categories = [...new Set(pages.map(page => page.category))].map(name => ({ name, pages: pages.filter(page => page.category === name).map(metadataFor) }))
await write(join(site, '.categories/guide.json'), JSON.stringify(categories, null, 2) + '\n')
await write(join(site, 'public/llms.txt'), `# Master Design\n\nPractical web interface guidelines. The canonical Markdown also ships in the portable master-design skill.\n\n${pages.map(page => `- [${page.title}](https://design.master.co/guidelines/${page.source.replace('skills/master-design/references/', '')}): ${page.description}`).join('\n')}\n`)
await generateSearchPages({ cwd: site, defaultLocale: 'en', locales: ['en'], dictionariesDir: join(site, 'i18n'), write: true })
console.log(`Prepared ${pages.length} pages from ${relative(root, join(root, 'skills/master-design/references'))}.`)
