import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pages } from '../catalog.mjs'

const attribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

function guideHead(page, origin) {
  const url = new URL(page.route, origin).href
  const home = page.route === '/'
  const schema = home
    ? { '@type': 'WebSite', '@id': url + '#website', name: 'Master Design' }
    : {
        '@type': 'TechArticle', headline: page.title, articleSection: page.category,
        mainEntityOfPage: url, isPartOf: { '@id': origin + '/#website' },
      }
  const json = JSON.stringify({ '@context': 'https://schema.org', ...schema, url, inLanguage: 'en', description: page.description }).replaceAll('<', '\\u003c')
  const imageAlt = attribute(`Master Design — ${page.documentTitle}`)
  return [
    `<link rel="alternate" type="text/markdown" href="${attribute(new URL(page.markdownPath, origin).href)}">`,
    `<link rel="describedby" href="${attribute(origin)}/llms.txt">`,
    `<meta property="og:url" content="${attribute(url)}">`,
    `<meta property="og:type" content="${home ? 'website' : 'article'}">`,
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${imageAlt}">`,
    `<meta name="twitter:image:alt" content="${imageAlt}">`,
    `<script type="application/ld+json">${json}</script>`,
  ].join('\n')
}

/** Complete the shared shell's static HTML and the Pages rules for its Markdown representations. */
export async function writeGuideDiscovery(output, origin) {
  const redirects = [await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')]
  const headers = [await readFile(new URL('../public/_headers', import.meta.url), 'utf8')]
  for (const page of pages) {
    const path = page.route === '/' ? '/index' : page.route
    const file = join(output, path + '.html')
    const html = await readFile(file, 'utf8')
    if (!html.includes('</head>')) throw new Error(`Missing document head for ${page.route}`)
    await writeFile(file, html.replace('</head>', () => guideHead(page, origin) + '\n</head>'))
    redirects.push(`${path}.md ${page.markdownPath} 301`)
    headers.push(`${page.markdownPath}\n  Link: <${new URL(page.route, origin).href}>; rel="canonical", </llms.txt>; rel="describedby"`)
  }
  await writeFile(join(output, '_headers'), headers.join('\n') + '\n')
  await writeFile(join(output, '_redirects'), redirects.join('\n') + '\n')
}
