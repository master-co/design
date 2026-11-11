# Legacy public-route and fragment review — 2026-11-12

The shared legacy manifest covers 40 old source routes across English, Traditional Chinese, Japanese, Korean and Simplified Chinese. Only the overview and surface concepts have an equivalent destination in the new guide. The other 38 routes return 410. Redirecting private helper APIs to a superficially related public component or guideline would imply a migration that did not happen.

The ten originally proposed redirect destinations were checked against explicit public heading, section and recipe-group IDs in `master/site/internal/design-system`. Embedded example-document IDs are outside this page-fragment scope. The complete reviewed inventory, reasons and target mappings live in [site/legacy-anchors.json](../../site/legacy-anchors.json).

| Former route | Status | Preserved anchors | Unmapped anchors | Reason |
| --- | --- | --- | --- | --- |
| `/design-system` | 301 | 1 | 4 | The overview now introduces design principles; its retired internal component catalog and exact material demonstrations have not moved. |
| `/design-system/authoring` | 410 | 0 | 38 | Internal Demo* import contracts, compiler fixtures and recipe collections remain private; the Master UI foundations page does not implement these APIs. |
| `/design-system/review/motion` | 410 | 0 | 3 | DemoMotion playback controls and an animation-play-state fixture are internal teaching helpers, not the general motion guideline. |
| `/design-system/review/palette` | 410 | 0 | 2 | DemoPalette exposes preset-family chips and clipboard feedback; no such inventory or API moved to the color guideline. |
| `/design-system/review/surface` | 301 | 2 | 2 | Surface ladder and recessed-well concepts are present in the elevation guideline; DemoSurface API documentation is not. |
| `/design-system/review/swatch` | 410 | 0 | 2 | DemoSwatch markup and sample paint roles remain an internal teaching helper, not a relocated color-guide component. |
| `/design-system/review/badge` | 410 | 0 | 2 | DemoBadge literal teaching tones differ from the public badge status-token contract. |
| `/design-system/review/controls` | 410 | 0 | 6 | DemoControls, Segments and iframe condition controls are internal helper APIs; the choosing guide does not contain them. |
| `/design-system/review/data-table` | 410 | 0 | 3 | BenchmarkDataTable disclosure and chart integration differ from the public table sorting/selection contract. |
| `/design-system/review/scroll` | 410 | 0 | 3 | DemoScrollArea and its overflow fixture differ from the public scroll-area fading-region API. |

Three site-only aliases preserve equivalent concepts: `/principles#interaction` precedes “Build on familiar behavior”; `/foundations/elevation#sheet-elevation` and `#well` precede “Establish a surface ladder.” They are emitted by the site adapter and do not modify the canonical Markdown, downloads or installed skill. The adapter fails when a mapped target heading disappears. Static artifact tests verify each alias immediately precedes its target section.

Retired internal APIs have no aliases. The surviving redirects cannot preserve their unmatched fragments semantically; the inventory records that limitation rather than presenting unrelated guidance as the original contract. Redirect fragments remain browser-owned, and server routing tests cover locale, slash and query handling independently.

The shared manifest is owned by Master. This inventory is a reviewed site compatibility fixture, not a second routing implementation. A future true content relocation must update the shared manifest, this inventory and the corresponding destination tests together.

The Design guide is English-only. Every supported legacy locale redirects to the same explicit English destination, without a locale prefix. Legacy Markdown requests use `/guidelines/principles.md` or `/guidelines/foundations/elevation.md`; appending `.md` directly to the HTML route would point at a missing file. Raw downloads preserve canonical skill headings and source-relative links; compatibility aliases belong only to HTML.
