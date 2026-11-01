# Interface Craft series synchronization — 2026-11-02

Before this update, local and remote `main` were both `6b1c840`. The seven additions from the companion publication had not been carried into the installed guidance source.

| Article work | Portable guidance |
| --- | --- |
| Common regions, nearby explanations, task hierarchy | Layout: grouping, explanation and hierarchy |
| Control mapping, progressive disclosure | Layout: controls and progressive disclosure |
| Visual encoding, simultaneous selection/focus/error | States: multiple state cues |
| Stable identity across waiting/processing/completion | Motion: identity across states |
| Fixed-height figure overflow and detached group outlines | Evidence: content bounds and comparison figures |
| Nested TOC and collapsed search filters | Layout: preserve expansion, focus and visible applied criteria |
| Publication covers, spanning cards and reading history | Site-specific implementation; no imposed brand/layout or persistence policy |

The figure issue was measured in the article renderer: a 200px-high card with 24px padding contained a 159px block in a 152px content area. A pseudo-element extended its group another 8px below that block. The old validation allowed a much smaller inset and missed this relationship even though text did not collide. The corrected source uses natural card sizing, an in-flow enclosure, matching text positions and captions following the actual specimen footprint. A known-good canvas shell is retained; its dimensions are not prescribed to consumers.

The seven versioned HTML/CSS illustrations, original assets and article-context screenshots remain in `1aron/aron.tw`, under `assets/posts/interface-craft/series-2026-11-02/layout-review/`. This repository receives the transferable guidance, not the article's complete asset archive. No executable example or public API changed here.

Validation: `bun run check` passed packaging, local links, types and 2 data tests; `bun run test:install` passed a detached temporary installation containing all 14 skill files. The companion project records the actual result and this repository's commit in `assets/posts/interface-craft/sync.json`; content hashes detect subsequent drift. Full browser/native example tests remain the CI regression suite; this guidance-only change does not claim new runtime behavior or physical-device testing.
