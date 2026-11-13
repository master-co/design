import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pages } from '../site/catalog.mjs'
import { webMarkdown, metadataFor } from '../site/scripts/content.mjs'
import { illustratedMarkdown, validateFigureCatalog } from '../site/scripts/illustrations.mjs'
import { figures, figuresFor } from '../site/figures/catalog.mjs'
import { stabilizeIslandIds } from '../site/scripts/stable-island-ids.mjs'
const root = resolve(import.meta.dirname, '..')

test('every public route resolves a self-contained source and adapts its local links', async () => {
  assert.equal(new Set(pages.map(page => page.route)).size, pages.length)
  assert.equal(new Set(pages.map(page => page.source)).size, pages.length)
  for (const page of pages) {
    assert(page.source.startsWith('skills/master-design/references/'))
    const markdown = await readFile(resolve(root, page.source), 'utf8')
    assert.match(markdown, /^# /)
    const web = webMarkdown(markdown, page.source)
    assert(!/^# /m.test(web), `${page.route} repeats the document title`)
    assert.equal(metadataFor(page).sourcePath, page.source)
  }
})

test('relative links become canonical routes while fragments and literal code survive', () => {
  const input = '# Test\n\n[Layout](../layout.md#mixed-content-rows)\n\n`../layout.md`\n\n```css\n.a { color: red; }\n```\n'
  const output = webMarkdown(input, 'skills/master-design/references/foundations/spacing.md')
  assert.match(output, /\[Layout\]\(\/craft\/layout#mixed-content-rows\)/)
  assert.match(output, /`\.\.\/layout.md`/)
  assert.match(output, /\.a \{ color: red; \}/)
  assert.match(webMarkdown('A literal {name} is text.', 'skills/master-design/references/foundations/spacing.md'), /\\\{name\\\}/)
  assert.throws(() => webMarkdown('[Missing](absent.md)', 'skills/master-design/references/principles.md'), /No public route/)
})

test('site adapters, search and downloaded Markdown preserve source ownership', async () => {
  const search = JSON.parse(await readFile(resolve(root, 'site/public/search/en.json'), 'utf8'))
  assert.equal(search.length, pages.length)
  for (const page of pages) {
    const directory = page.route === '/' ? '(home)' : page.route.slice(1)
    const generated = await readFile(resolve(root, 'site/content', directory, 'content.mdx'), 'utf8')
    const source = await readFile(resolve(root, page.source), 'utf8')
    const depth = directory.split('/').length
    assert.equal(generated, illustratedMarkdown(source, page.source, '../'.repeat(depth + 1) + 'components'))
    const download = await readFile(resolve(root, 'site/public/guidelines', page.source.replace('skills/master-design/references/', '')), 'utf8')
    assert.equal(download, source)
    assert(search.some(entry => new URL(entry.url, 'https://design.master.co').pathname === page.route), `Missing search route ${page.route}`)
  }
})

test('site figures fail for missing sections, sources, renderers and duplicate IDs', () => {
  validateFigureCatalog(pages)
  const entry = figures[0]
  assert.throws(() => validateFigureCatalog(pages, [entry, entry]), /Duplicate/)
  assert.throws(() => validateFigureCatalog(pages, [{ ...entry, source: 'absent.md' }]), /Missing canonical/)
  assert.throws(() => validateFigureCatalog(pages, [{ ...entry, component: 'Absent' }]), /Missing figure renderer/)
  assert.throws(() => illustratedMarkdown('# Test\n\n## Other\n\nText.', entry.source, '../components', [entry]), /expected one section/)
})

test('site presentation never enters the installed knowledge or Markdown downloads', async () => {
  for (const page of pages) {
    const source = await readFile(resolve(root, page.source), 'utf8')
    assert(!/GuideFigure|DesignLab|TaskStudy|doc-illustrations|site\/components|\.agents\//.test(source), page.source)
    const directory = page.route === '/' ? '(home)' : page.route.slice(1)
    const generated = await readFile(resolve(root, 'site/content', directory, 'content.mdx'), 'utf8')
    for (const entry of figuresFor(page.source)) assert(generated.includes(`id="${entry.id}"`), `Missing ${entry.id}`)
  }
})

test('moved UI material has no stale Design page, download or search entry', async () => {
  const search = JSON.parse(await readFile(resolve(root, 'site/public/search/en.json'), 'utf8'))
  assert(!pages.some(page => page.route === '/master-ui'))
  assert(!search.some(entry => new URL(entry.url, 'https://design.master.co').pathname === '/master-ui'))
  for (const file of ['skills/master-design/references/master-ui.md', 'site/content/master-ui/content.mdx', 'site/public/guidelines/master-ui.md']) {
    await assert.rejects(access(resolve(root, file)), { code: 'ENOENT' })
  }
  const redirects = (await readFile(resolve(root, 'site/public/_redirects'), 'utf8')).trim().split('\n').map(line => line.split(/\s+/))
  for (const source of ['/master-ui', '/master-ui/', '/master-ui.html', '/guidelines/master-ui.md', '/master-ui.md']) {
    const rule = redirects.find(([path]) => path === source)
    assert(rule, `Missing redirect for ${source}`)
    assert.equal(rule[1], `https://ui.master.co/guide/design${source.endsWith('.md') ? '.md' : ''}`)
    assert.equal(rule[2], '301')
    assert.equal(new URL(rule[1]).hash, '', 'The destination must allow a retained source fragment')
  }
  const sizing = await readFile(resolve(root, 'site/content/foundations/sizing/content.mdx'), 'utf8')
  assert(sizing.includes('<StudyFrame id="density-preview" />'), 'The density example stays available with the sizing guidance')
})

// Compatibility aliases are site metadata, never part of the installed skill text.
test('legacy fragments point only to equivalent sections and missing targets fail', async () => {
  const inventory = JSON.parse(await readFile(resolve(root, 'site/legacy-anchors.json'), 'utf8'))
  let count = 0
  for (const route of inventory.routes) {
    if (!route.destination) { assert.deepEqual(route.aliases, {}); continue }
    const page = pages.find(page => page.route === new URL(route.destination).pathname)
    assert(page)
    const source = await readFile(resolve(root, page.source), 'utf8')
    const output = webMarkdown(source, page.source)
    for (const [alias, target] of Object.entries(route.aliases)) {
      assert(output.includes(`id="${alias}" class="design-legacy-anchor" data-legacy-target="${target}"`))
      assert(!source.includes(`id="${alias}"`))
      count++
    }
    for (const id of route.unmappedAnchors) assert(!output.includes(`id="${id}"`))
  }
  assert.equal(count, 3)
  assert.throws(() => webMarkdown('# Principles\n\n## Unrelated topic', 'skills/master-design/references/principles.md'), /Missing legacy anchor target/)
})

test('island ids depend on public island markup, not on the checkout path', () => {
  const island = (uid, props = '{}') => `<astro-island uid="${uid}" component-url="/_astro/A.js" props="${props}" ssr client="load">`
  const page = uid => `${island(uid)}<p>a</p></astro-island>${island(uid + 'x')}</astro-island>${island('z', '{&quot;a&quot;:1}')}</astro-island>`
  const first = stabilizeIslandIds(page('runner')), second = stabilizeIslandIds(page('buildhome'))
  assert.equal(first, second)
  const ids = [...first.matchAll(/uid="([^"]+)"/g)].map(match => match[1])
  assert.equal(ids.length, 3)
  assert.equal(new Set(ids).size, 3, 'Identical islands on one page keep distinct ids')
  assert.equal(stabilizeIslandIds(first), first)
  assert.equal(stabilizeIslandIds('<astro-island component-url="/_astro/A.js">'), '<astro-island component-url="/_astro/A.js">')
})
