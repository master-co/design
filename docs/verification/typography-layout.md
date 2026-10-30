# Typography and mixed-content rows — 2026-10-30

The [specimen README](../../examples/interface-craft/typography-layout/README.md) explains the controlled variables. Run `bun run build`, `bun run check`, `bun run test:install`, `bun run test:typography` and `bun run capture:typography`. Results, versions, font reports and screenshots go to ignored `artifacts/typography-check/`.

Source-backed measurements in Chromium 153.0.8010.12 and WebKit 26.6: natural/compensated/translated flex rows are 36/24/36 CSS px with all targets still 36px; uniform/action-cell table padding gives 52/40px rows. The compensated button is hit-tested above its row boundary. Inline measurements remain font-dependent.

The matrix covers five locales, widths 320/390/1440, both themes and 100%/200% specimen text. It checks Chromium's actual local fonts, keyboard activation without geometry movement, hover, checkbox/radio/switch state, input/select edits, disabled controls, no-JavaScript content and emulated touch. Unsupported CSS is reported. Syntax acceptance is not treated as a visual result.

Boards use 1440×1000 logical canvases and export at 2×. Local detail enlargement is labeled; native row screenshots are separate. Physical displays, assistive technologies and OS/browser zoom are not claimed as tested.

The compact [recorded results](typography-layout.json) include exact bounds, custom-font reports, measured spacing and actual line-break strings. In this run, Chromium supports the punctuation trim specimen while WebKit retains its normal layout; ideographic text-edge syntax has the opposite support split. The study reports those independently.
