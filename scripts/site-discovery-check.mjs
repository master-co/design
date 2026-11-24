import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { DOMParser, parseHTML } from 'linkedom'
import { pages, siteOrigin } from '../site/catalog.mjs'

/** Check the files a crawler receives, including the Pages rules applied to non-HTML formats. */
export async function verifyGuideIndexes(output) {
  const read = file => readFile(join(output, file), 'utf8')
  const [xml, robots, index, full, redirects, headers, missing] = await Promise.all(
    ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt', '_redirects', '_headers', '404.html'].map(read),
  )
  const sitemap = new DOMParser().parseFromString(xml, 'application/xml')
  assert.equal(sitemap.documentElement.getAttribute('xmlns'), 'http://www.sitemaps.org/schemas/sitemap/0.9')
  const urls = [...sitemap.querySelectorAll('urlset > url > loc')].map(node => node.textContent)
  assert.deepEqual(urls.sort(), pages.map(page => new URL(page.route, siteOrigin).href).sort(), 'Sitemap covers each canonical page once')
  const listedFiles = new Set(pages.map(page => page.route === '/' ? 'index.html' : page.route.slice(1) + '.html'))
  for (const file of await readdir(output, { recursive: true })) {
    if (!file.endsWith('.html') || listedFiles.has(file.split(sep).join('/'))) continue
    const { head } = parseHTML(await read(file)).document
    assert.match(head.querySelector('meta[name="robots"]')?.content ?? '', /\b(?:noindex|none)\b/i, `${file} is indexable but missing from the sitemap`)
  }
  assert(robots.split('\n').includes(`Sitemap: ${siteOrigin}/sitemap.xml`))
  assert.match(robots, /^User-agent: \*\nAllow: \/$/m)
  const topics = [...index.matchAll(/^- \[.*?\]\(([^)]+\.md)\)/gm)].map(match => match[1])
  assert.deepEqual(topics.sort(), pages.map(page => new URL(page.markdownPath, siteOrigin).href).sort())
  assert(index.includes(`(${siteOrigin}/llms-full.txt)`))
  assert(headers.split('\n').filter(line => /^(?:\/|https:\/\/)/.test(line)).length <= 100, 'Cloudflare Pages accepts up to 100 header rules')
  const redirectRules = redirects.split('\n')
  for (const page of pages) {
    const url = new URL(page.route, siteOrigin).href
    assert(full.includes(`[Read this page on Master Design](${url})`), page.route)
    assert(redirectRules.includes(`${page.route === '/' ? '/index' : page.route}.md ${page.markdownPath} 301`), page.route)
    assert(headers.includes(`${page.markdownPath}\n  Link: <${url}>; rel="canonical"`), page.markdownPath)
    assert.equal(await read(page.markdownPath), await readFile(new URL('../' + page.source, import.meta.url), 'utf8'))
  }
  assert(full.includes(`[Design principles](${siteOrigin}/guidelines/principles.md)`), 'Relative links in the combined guide resolve from the original document')
  assert(full.includes((await read('guidelines/LICENSE.txt')).trimEnd()))
  const errorHead = parseHTML(missing).document.head
  assert.match(errorHead.querySelector('meta[name="robots"]')?.content ?? '', /\bnoindex\b/i)
  assert.equal(errorHead.querySelector('link[rel="canonical"],link[type="text/markdown"]'), null)
}

export async function verifyGuideHead(page, document, output) {
  const { head } = document
  const url = new URL(page.route, siteOrigin).href
  const one = (selector, attribute) => {
    const nodes = head.querySelectorAll(selector)
    assert.equal(nodes.length, 1, `${page.route} needs exactly one ${selector}`)
    return nodes[0].getAttribute(attribute)
  }
  assert.equal(document.documentElement.lang, 'en')
  assert.equal(head.querySelector('title')?.textContent, page.documentTitle + ' - Master Design')
  assert.equal(document.querySelector('h1')?.textContent.trim(), page.title)
  assert.equal(one('meta[name="description"]', 'content'), page.description)
  assert.doesNotMatch(head.querySelector('meta[name="robots"]')?.content ?? '', /\b(?:noindex|none)\b/i)
  assert.equal(one('link[rel="canonical"]', 'href'), url)
  assert.equal(one('link[rel="alternate"][type="text/markdown"]', 'href'), new URL(page.markdownPath, siteOrigin).href)
  assert.equal(one('link[rel="describedby"]', 'href'), siteOrigin + '/llms.txt')
  assert.equal(one('meta[property="og:url"]', 'content'), url)
  assert.equal(one('meta[property="og:type"]', 'content'), page.route === '/' ? 'website' : 'article')
  assert.equal(one('meta[property="og:title"]', 'content'), page.documentTitle)
  assert.equal(one('meta[property="og:description"]', 'content'), page.description)
  const image = new URL(one('meta[property="og:image"]', 'content'))
  assert.equal(image.origin, siteOrigin)
  assert(image.pathname.endsWith('.png'), `${page.route} must share a static PNG`)
  assert.equal(one('meta[name="twitter:image"]', 'content'), image.href)
  assert(one('meta[property="og:image:alt"]', 'content'))
  const png = await readFile(join(output, image.pathname))
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a')
  assert.equal(one('meta[property="og:image:width"]', 'content'), String(png.readUInt32BE(16)))
  assert.equal(one('meta[property="og:image:height"]', 'content'), String(png.readUInt32BE(20)))
  const schema = JSON.parse(head.querySelector('script[type="application/ld+json"]').textContent)
  assert.equal(schema['@type'], page.route === '/' ? 'WebSite' : 'TechArticle')
  assert.equal(schema.name ?? schema.headline, page.route === '/' ? 'Master Design' : page.title)
  assert.equal(schema.url, url)
}
