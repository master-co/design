import { stableDevRuntime } from './scripts/dev-runtime'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import masterSite from '@master/internal-site/astro'
import site from './site.config'
import { stabilizeIslandIdsIn } from './scripts/stable-island-ids.mjs'
Object.assign(process.env, { PUBLIC_PROJECT: 'Master Design', PUBLIC_URL: site.origin, PUBLIC_IMAGE_TRANSFORMATIONS: 'false' })
export default defineConfig({
  outDir: './out',
  server: { port: 3400 },
  devToolbar: { enabled: false },
  vite: { plugins: [stableDevRuntime()] },
  integrations: [
    masterSite(site),
    // Cloudflare Pages rebuilds the delivered commit and must reproduce the verified bytes exactly.
    { name: 'design-stable-island-ids', hooks: { 'astro:build:done': ({ dir }) => stabilizeIslandIdsIn(fileURLToPath(dir)) } },
  ],
})
