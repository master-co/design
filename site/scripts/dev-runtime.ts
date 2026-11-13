import type { Plugin } from 'vite'

/** Astro 7.4.2's per-manifest registries must retain one identity during cold startup. */
export function stableDevRuntime(): Plugin {
  return {
    name: 'design:stable-dev-runtime',
    apply: 'serve',
    enforce: 'post',
    configResolved(config) {
      // Svelte's integration adds explicit server prebundles. noDiscovery alone does
      // not disable those: their first optimization changes Vite's ?v= module IDs,
      // splitting Astro's environment WeakMap between registration and route lookup.
      // Apply this after integrations merge their includes; keep client optimization.
      for (const name of ['ssr', 'prerender', 'astro']) {
        const environment = config.environments[name]
        if (!environment) continue
        environment.optimizeDeps.noDiscovery = true
        environment.optimizeDeps.include = []
      }
    },
  }
}
