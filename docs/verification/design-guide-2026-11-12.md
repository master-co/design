# Master Design guide — 2026-11-12

The public guide and portable skill now share the Markdown under `skills/master-design/references/`. The site catalog contains route metadata only; the preparation step resolves relative Markdown links, generates ignored MDX adapters, keeps edit links pointed at original skill files and builds search and downloadable Markdown. Downloaded files retain the source directory relationships so their relative references remain valid.

## Coverage

The guide contains 35 routes: an overview, principles, accessibility, Master UI foundations, eight visual foundations, seven component groups, six task patterns and ten existing craft references. The existing research examples and figure mappings are retained. The Master UI chapter explains Moonstone, Obsidian, Paper, material roles, concentric geometry, concurrent state feedback and customization boundaries, with observable criteria and 23 checked implementation links. Master UI-specific guidance is explicitly scoped; unrelated consumers retain their own framework, brand, fonts and density.

## Checks

- `bun run check`: packaging, local links, version consistency, example types and 13 tests passed.
- `bun run check:site`: Astro and Svelte reported zero errors and warnings; source/adaptation/search tests passed.
- `bun run test:install`: one detached skill, 38 files, with no external local-file dependency.
- Skill Creator `quick_validate.py`: passed in an isolated temporary Python environment.
- Existing brand and near-white forward scenarios: 28 and 31 checks passed in copies under ignored `artifacts/forward-run`, preserving the original reviewed evidence files.
- `bun run build:site`: 35 guide pages, a 404 page and sitemap built as static output.
- Preserved craft suites: avatars, typography, reading controls, dashboard, browser interactions and native raster checks all passed after the final registry install, including ten native engine/density combinations.
- `bun run test:site`: every generated page's internal destination and fragment resolved, including three reviewed legacy aliases; Chromium 153.0.8010.12 and WebKit 26.6 passed in light and dark appearances.

Browser checks cover the interactive density specimen, native radio selection, save feedback, first-click search, compact menu Escape, guide navigation, 320 CSS pixel reflow and 200% text. Chromium also checks keyboard focus in forced colors. Screenshots and a machine-readable report are generated under ignored `artifacts/site/`; desktop light and narrow dark views were visually inspected at their rendered size.

The first WebKit run found a real shared-shell hydration race: the search trigger was ready before the idle search listener, so the first activation disappeared. The shared site package now retains an unconsumed opening request and loads the lightweight listener promptly. The same first-click check passes without a delay or repeated click.

Cold hosted WebKit testing then exposed a separate earlier boundary: the server-rendered header accepted a click before its own Svelte handler existed. Three fresh sessions reproduced a lost click with the header still marked as SSR, while Chromium hydrated before the click. The shared shell now renders Search and Menu explicitly disabled until their behavior mounts, while preserving a caller-disabled Search control. The deterministic regression holds the actual header module response, verifies unavailable SSR controls and then proves the first enabled activation works. It passed against the fixed Master build in Chromium and WebKit, on desktop and mobile; the same regression is part of Design browser validation. The Design-only foundation specimen uses the same readiness boundary for both density options, its field and Save action. Holding its module proves every control is unavailable before the local handler mounts and that the first enabled submission preserves the entered value; this catches a native form submission occurring before hydration.

## Limits

These checks do not certify complete WCAG conformance. A physical touch device and screen reader were not tested; VoiceOver validation was explicitly waived for this delivery. Deployment and custom-domain verification are separate from the local artifact checks. Final verification uses published registry packages `@master/internal-site@0.2.8` and `@master/ui@0.0.2`, installed into empty root and site dependency directories with a fresh cache. The subsequent frozen install made no changes and `check:site-pins` passed for every direct first-party package. Downloaded registry tarball bytes matched their published SHA-512 integrity: shared site `8WuPdDKvP3fZ+FGxDVQI3hugKFHinC9Le72VRqaZqmNnIB+w78TQxKKjw5KX0N8mALJtn3cClGywD8piRjRR5A==` (3,563,896 bytes), UI `nEkQjCPmTKPDXwKlE+usJFQQ2CMGskV1nCQD1uZB+NYyMKaLuazlpbtI2ZAErfSHEspImjN/sxH6ZLFY9Mx+EA==` (422,856 bytes).
