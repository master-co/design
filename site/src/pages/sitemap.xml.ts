import type { APIRoute } from 'astro'
import { pages, siteOrigin } from '../../catalog.mjs'

export const GET: APIRoute = () => {
  const entries = pages.map(page => `  <url><loc>${new URL(page.route, siteOrigin).href.replaceAll('&', '&amp;')}</loc></url>`)
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
