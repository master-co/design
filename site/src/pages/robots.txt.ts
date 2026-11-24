import type { APIRoute } from 'astro'
import { siteOrigin } from '../../catalog.mjs'

export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
})
