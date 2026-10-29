# Verification

## Reproduce

`bun run check` validates the skill metadata, self-contained links, case map, TypeScript and data/geometry logic. `bun run test:install` checks discovery and a real temporary project installation. It does not change global agent settings.

`bun run test:browser` checks the workspace at desktop and narrow widths in Chromium/WebKit, light/dark themes, search/filter/selection behavior, result scope, keyboard, touch, reduced motion and a no-JavaScript fallback.

`bun run test:native` checks affected contours and numeric columns at 1×, 2×, 3×, 1.25× and 1.5×. Both engines use browser-emulated device pixel densities and save unresampled raster output. This is separate from OS scaling or browser zoom. Enlarged diagram geometry is kept separate from these checks.

`bun run capture` exports selected plates and the complete workspace using the same rendered source as the interactive example. Its manifest includes source/output hashes, dimensions and actual renderer versions. Machine-local outputs live in ignored `artifacts/`.

## Independent forward tests

Two isolated agents receive only a frozen skill, a raw fixture and a user task. One retains a distinct existing brand; the other explicitly selects Aron preferences. Neither receives the intended fixes or the other agent's work. Their reports distinguish implemented changes, actual checks and unverified conditions. Reviewed reports and an outcome summary are saved under `verification/`.

Real assistive-technology and physical touch-device testing are separate from browser automation. Do not present emulation as a hardware test or a passing syntax validator as proof of good design judgment.

## Recorded run — 2026-10-30

The temporary `skills@1.4.9` installation discovered one complete skill and copied its references independently of the checkout. The official skill-creator validator also passed. The two [independent forward tests](verification/README.md) passed their recorded 28 and 31 checks; their reviewed fixtures, verifiers, hashes and screenshots are retained.

Workspace browser checks passed Chromium 153.0.8010.12 and WebKit 26.6 at 1440, 900, 390 and 320 CSS px in light/dark appearances. Native tests passed ten engine/density combinations. They record subpixel text ranges and unresampled edge pixels, not merely CSS declarations. WebKit rounded the computed inward outline offset to device pixels at fractional densities; the declared −1px is not a promise of identical computed/raster width everywhere. The final source-backed numeric grid measured at most 0.015625 CSS px between decimal text-range positions in Chromium and zero in the tested WebKit samples. These are bounds for these strings and fonts, not a cross-platform alignment guarantee.

Raw current-run exports live in ignored `artifacts/`. Portable selected evidence summaries are retained in this directory. Physical devices, real screen-reader sessions, Firefox and OS/browser zoom remain unverified.


## Dashboard detail correction — 2026-10-30

A user review identified regressions that the initial behavioral checks missed. A broad link reset had overridden navigation colors; native checkboxes had changed size and moved right inside their enlarged targets; the reporting-period surface had lost its boundary. The semantic conversion also changed a sidebar icon and table column starts. Dark-theme secondary text and progress tracks needed a separate audit.

`bun run test:dashboard` now compares twenty component groups directly against the approved drawing source: their relative geometry, navigation paint, icon geometry, first seven table starts, checkbox bounds and row heights. It also checks the restored 212×34 reporting-period surface, keyboard focus/Space activation, 44×44 mobile targets, intermediate-width progress containment, light/dark layouts, forced-colors fallback and unresampled checkbox captures at five densities in both engines. These checks supplement visual review; behavioral success alone did not catch the original problem.

## Avatar stacking — original concept comparisons

The avatar extension stays in the existing Images route; it is not a second skill or a public component API. A1/A2 compare gap6 with overlap8 at fixed D32, G2, image source/crop and inward stroke. Both hosts and group inline-start/vertical center match. Layout/derived painted widths are 108/112 versus 80/84. A2 holds white 10% on both sides; B2 uses the opt-in white 8% inset specimen. B1/B2 hold stacking and separator fixed while comparing inset presence. The old separator-presence comparison is a separate live control.

`bun run test:avatars` exercises exact overflow counts, RTL DOM order and last-on-top painting, failed-photo geometry, mixed content, patterned-host spacing fallback, native dialog/role disclosure, keyboard/Escape/focus return, touch emulation and no-JavaScript reading. The actual dashboard's D22/O5 circle and glyph positions are compared with the original source. Selected/hover/dark separators match their actual row surface.

Chromium/WebKit native checks use 1×/2×/3×/1.25×. Native pixel comparisons toggle the inset on the same element at the same coordinates, avoiding fractional raster-phase differences between separate screen locations. They verify an actual photo-edge difference and unchanged central pixels, rather than relying on a CSS support query or declared shadow. Separate unresampled captures preserve the original native geometry. Geometry magnification in the four diagrams is explicitly marked ×4.

Physical devices and real screen-reader sessions remain unverified. Exact test outcomes and renderer versions are retained in `docs/verification/runtime/avatars.json`; editable originals and full exports remain in the example and ignored artifacts, with photo provenance in `assets/avatars/`.


## Traditional Chinese article integration

The v4 candidate incorporates the four avatar studies into its image-finishing section. It now has 39 static figures and two interactions, retaining original 01–35 and A/B source labels with a separate reading index. The article describes arrangement, host-colored separation, image inset and participant access using original examples. Publishing and five-language migration remain separate from these local saves.


## Cross-platform numeric rendering — 2026-10-30

The first clean Linux run caught a real specimen discrepancy: Chromium reported decimal positions of 168, 168 and 169 CSS pixels at native 1×, with Geist loaded, tabular figures enabled and kerning disabled. Explicit font readiness and separate caret/selection measurements did not remove it. These diagnostics remain distinct from a font-support query.

The numeric study now scopes `text-rendering: geometricPrecision` to both amount columns. Font, size, strings, precision, spacing and the left/right alignment comparison remain fixed. This rendering choice is specific to the specimen; it is not an instruction to override the consumer project globally. The native check retains its original 0.3 CSS-pixel alignment threshold, saves metrics and the unresampled screenshot before asserting, and records caret and selection positions separately. No tolerance was increased.

Fresh Linux Chromium/WebKit at 1×/2×/3×/1.25×/1.5× passed all ten combinations. Chromium's decimal range is 0.015625 CSS pixels; WebKit's is zero in these strings. The same ten combinations passed locally on macOS. See `runtime/native-linux-geometric.json` and `runtime/native-macos-geometric.json`; the earlier native record remains historical. Complete [CI run 40944422139](https://github.com/master-co/design/actions/runs/40944422139) passed packaging, installation, avatar, dashboard, behavior and native checks.

The dashboard export hash did not change. The article retains its approved, versioned v4 raster artwork and browser export; the updated repository study records the additional cross-platform rendering choice. Browser emulation still does not substitute for physical-device or screen-reader sessions.
