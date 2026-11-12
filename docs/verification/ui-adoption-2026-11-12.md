# Canonical UI adoption — final registry validation

The Design site now pins `@master/ui` 0.0.3 and `@master/internal-site` 0.2.9. The shared shell consumes canonical UI code, alerts, cards, surfaces, tabs, disclosure and search components, while Design retains its guide navigation and foundation example. The canonical skill remains unchanged at 0.3.0; this update does not create a new skill release.

## Package identity

A fresh install used a new registry cache. Every installed file was compared byte-for-byte with independently downloaded registry archives: 308 UI files and 775 shared-package files. The shared package resolves the same UI 0.0.3 peer as the site. Exact-pin verification and a frozen reinstall pass.

| Package | Archive bytes | SHA-256 |
| --- | ---: | --- |
| `@master/ui@0.0.3` | 424122 | `41a2c566e757c4d009512878553fee74856b2afae96211ed442706fcf2ba47a4` |
| `@master/internal-site@0.2.9` | 3562507 | `3a2c8b0fbc132143d95d91f9417383eaa4a05382ec68655e3760c13fe16f4932` |

Each archive also matches the registry's SHA-512 integrity value. The shared archive matches the coordinated release's CI artifact. `bun.lock` records both integrity values; no local archive, sibling dependency or extracted candidate remains in the installed site graph. The one-day dependency age policy has exceptions only for these two exact reviewed releases.

## Validation

- Standalone craft build, packaging/data checks and all 13 unit tests pass. A detached install contains one self-contained skill with 38 files.
- Astro/Svelte checking reports no errors or warnings. Four site adapter/source tests pass.
- The static build emits 35 guide pages plus the 404 page. Every local built link and fragment resolves, and the three compatibility aliases remain attached to their equivalent sections. Downloaded Markdown remains generated from canonical skill sources.
- Chromium and WebKit pass the held-module regressions: header actions remain disabled until their handlers exist, and the first enabled desktop search/mobile menu activation succeeds. The foundation example keeps its density, name and submit controls disabled until mounted; its first enabled submission retains the entered value.
- Search is tested in both appearances against a canonical UI command frame, including listbox content parts. Chromium additionally verifies visible keyboard focus on the empty search input in forced colors. These assertions are part of `scripts/site-browser-check.mjs`.
- Both engines pass density/submission behavior, search results, menu Escape, 320-pixel navigation and 200% text reflow without runtime errors. Search screenshots wait for browser animations to finish before capture.

VoiceOver was explicitly waived by the user and was not tested. Browser emulation is not a claim of physical-device testing.

## Release and rollback boundaries

The independent website workflow runs the full reusable validation and retains its exact commit's static artifact. Production deployment must use that tested artifact, then compare live HTTPS pages/assets with it and repeat the cold-start search/menu/example checks. The portable skill release workflow remains separate.

Rollback commit `056bf59385190ef48124af145d4458230867a07c` and its prior production deployment, `https://729edd9e.master-design-a5q.pages.dev`, are retained. The previous output is also preserved in ignored `artifacts/rollback-056bf59/`. CI run identity, the final Pages deployment and post-deployment byte/browser checks are recorded by the coordinated integration run; this document does not substitute local checks for those gates.
