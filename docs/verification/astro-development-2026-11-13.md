# Astro development preview — 2026-11-13

`bun run dev` now serves the guide through Astro with live canonical-source regeneration and component/style HMR. The local preview uses port 3400 by default. It is a foreground process and stops with Ctrl+C.

## Diagnosed failures

An empty Vite cache reproduced a 500 on the very first request to the shared `/[...path]` route. Temporary instrumentation of the loaded Astro environment module showed two instances with different Vite `?v=` hashes: the manifest was registered in one WeakMap and looked up in another. That lookup fell back to the production environment, whose component map does not contain the dev route. A warm restart masked the failure.

`noDiscovery: true` alone did not fix it because the Svelte integration had already added explicit server prebundles. The dev-only `stableDevRuntime` plugin clears those server includes after configuration merging and disables automatic discovery for `ssr`, `prerender` and `astro`. Client optimization stays enabled. This uses the distinction documented in [Vite dependency optimization options](https://vite.dev/config/dep-optimization-options#optimizedeps-nodiscovery); the particular failure mechanism was observed in the installed Astro 7.4.2/Vite 8.3.5 module graph, not inferred solely from that documentation. Diagnostic instrumentation was removed.

Live-edit testing exposed a second failure: the shared-site integration restarted Vite on every MDX body change. Closely spaced saves could interrupt module delivery while the browsers were reloading and leave an open page disconnected or stale. The repository-local Bun patch for `@master/internal-site@0.2.12` compares document frontmatter before requesting a route refresh. Unchanged frontmatter leaves ordinary body changes to Astro's HMR; frontmatter and structural changes retain the integration's existing refresh path. Both the package source and distributed entry point are patched. No other repository was edited.

## Canonical source watching

The development runner watches reference Markdown, the page catalog, figure registration and preparation scripts. It debounces and serializes generation so overlapping saves finish with the latest source. These Node watchers outlive Vite restarts. Astro continues to own `.astro`, `.svelte` and CSS updates. Preparation failures are reported without killing the watcher; correcting a missing figure section resumes generation on the next save.

The runner uses Astro's programmatic dev API from the pinned version. It does not alter the production builder. Changes to the runner itself require restarting `bun run dev`. Structural document changes may restart the shared server and reset local example state; this is different from an ordinary component/style hot update.

## Observed checks

Node 24.20.0 and Bun 1.4.4 were used. `bun run test:site-dev` creates an isolated fixture with its own Vite cache under `artifacts/site-dev`; test edits never touch the working guide. Chromium 153.0.8010.12 and WebKit 26.6 checked:

- Two empty-cache startups, including the first request without a retry; all 51 guide routes returned 200.
- Canonical Markdown changes appeared in both already-open browser pages without manual reload. Search JSON and downloaded Markdown also updated.
- Rapid successive edits displayed the latest content.
- Figure registry and Astro drawing changes updated both browsers.
- Invalid section registration reported a generation error; restoring it resumed generation without restarting the runner.
- CSS and Svelte edits appeared live. The updated color experiment still accepted input and reset correctly.
- The complete service case hydrated and displayed its two field errors after submission.

`bun run check` passed all 66 tests; `bun run check:site` reported no Astro/Svelte errors or warnings and passed its eight tests. `bun run build:site` completed, and all 252 output files were byte-identical to the preceding validated build. The full `bun run test:site` regression passed in Chromium and WebKit. A frozen Bun installation reported no changes and retained the dependency patch.

The actual preview on `http://127.0.0.1:3400` was also opened in both engines and its service-case validation was exercised. Generated logs and reports are in `artifacts/site-dev`, `artifacts/dev-build-comparison.json` and `artifacts/dev-*.log`.

## Boundaries

No dependency version or public skill version was raised. `bun.lock` records the local patch. No release, deployment, Git commit or global installation was performed. Browser HMR tests are not screen-reader or physical-device checks. Production output equivalence supports the development-only scope; it does not replace validation when the pinned dependencies or shared patch change later.
