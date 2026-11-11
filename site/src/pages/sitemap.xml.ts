import type { APIRoute } from 'astro'
import { pages } from '../../catalog.mjs'
export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `<url><loc>https://design.master.co${page.route === '/' ? '' : page.route}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } })
