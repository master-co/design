import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pages } from '../site/catalog.mjs'
import { webMarkdown, metadataFor } from '../site/scripts/content.mjs'
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
    assert(generated.includes(webMarkdown(source, page.source)))
    const download = await readFile(resolve(root, 'site/public/guidelines', page.source.replace('skills/master-design/references/', '')), 'utf8')
    assert.equal(download, source)
    assert(search.some(entry => new URL(entry.url, 'https://design.master.co').pathname === page.route), `Missing search route ${page.route}`)
  }
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
