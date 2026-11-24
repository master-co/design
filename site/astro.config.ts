import { stableDevRuntime } from './scripts/dev-runtime'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import masterSite from '@master/internal-site/astro'
import { generateStaticSocialImages } from '@master/internal-site/build/static-social.ts'
import site from './site.config'
import { writeGuideDiscovery } from './scripts/discovery.mjs'
import { stabilizeIslandIdsIn } from './scripts/stable-island-ids.mjs'
Object.assign(process.env, { PUBLIC_PROJECT: 'Master Design', PUBLIC_URL: site.origin, PUBLIC_IMAGE_TRANSFORMATIONS: 'false' })
export default defineConfig({
  outDir: './out',
  server: { port: 3400 },
  devToolbar: { enabled: false },
  vite: { plugins: [stableDevRuntime()] },
  integrations: [
    masterSite(site),
    { name: 'design-guide-discovery', hooks: { 'astro:build:done': async ({ dir }) => {
      const outDir = fileURLToPath(dir)
      await generateStaticSocialImages({
        siteDir: fileURLToPath(new URL('.', import.meta.url)), outDir, origin: site.origin,
        logo: new URL('../assets/brand/logo/master-design-horizontal-on-light@2x.png', import.meta.url),
      })
      await writeGuideDiscovery(outDir, site.origin)
    } } },
    // Cloudflare Pages rebuilds the delivered commit and must reproduce the verified bytes exactly.
    { name: 'design-stable-island-ids', hooks: { 'astro:build:done': ({ dir }) => stabilizeIslandIdsIn(fileURLToPath(dir)) } },
  ],
})
