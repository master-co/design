# Harbor dispatch refinement

The implementation is in [work/index.html](../work/index.html), with an identical standalone delivery copy at [harbor-dispatch.html](harbor-dispatch.html). The immutable `before/` fixture was not edited. No dependencies, frameworks, remote assets, or new product behavior were added.

## Changes and reasoning

- **Card surface:** retained the existing two-pixel teal border and four-pixel corners. Removed the hard white inset stripe and replaced the broad eight-pixel-offset shadow with a restrained two-pixel contact shadow using the same ink color. The outlined, square character remains; the lower edge no longer carries a heavy halo.
- **View control:** replaced two separately outlined buttons with one continuous frame and a single two-pixel internal seam. Inner corner radii are two pixels inside the four-pixel frame. The original amber selection remains, with a small ink underline as a persistent non-color cue. Hover, momentary press, keyboard focus, and selection have separate treatments. Pressing no longer scales the control or moves its label.
- **Route details:** used a description list for label/value relationships and a baseline-aligned grid. Values stay right-aligned and use tabular figures. Longer labels can wrap without colliding with the time window.
- **Metadata:** changed the three solid badge-like blocks to a compact secondary text row. Twelve-pixel type and consistent sixteen-pixel horizontal gaps clarify that these are supporting information. Wrapping remains available without clipping.
- **Semantics:** named the route section and the native button group; kept one `aria-pressed="true"` button at a time. Marked the existing check time with a `time` element.

These are visual judgments within the supplied brand. The exact palette remains `#124f59`, `#f9f5e9`, `#f6ba55`, `#eee9da`, and `#41717a`. Georgia headings, system body type, thirty-pixel page padding, sixteen-pixel narrow-screen padding, the 660-pixel maximum width, and eighteen-pixel card padding remain.

## Measured results

At a 1000 × 700 CSS-pixel viewport, the baseline measurements below are from Chromium; the after measurements match in both tested engines:

| Relationship | Before | After |
| --- | --- | --- |
| Card width | 660 px | 660 px |
| Card height | 208 px | 206 px |
| Card border / radius | 2 px / 4 px | 2 px / 4 px |
| Complete view-control height | 41 px | 41 px |
| Shared button seam | Two adjacent 2 px borders | One 2 px border |
| Heading / body families | Georgia / system-ui | Georgia / system-ui |

The after-state native button targets measure approximately 64 × 37 and 83 × 37 CSS pixels inside the shared frame. Their bounds stay identical across selection and active states. Chromium's platform-font inspection confirms Georgia for both headings and SF NS for body labels, values, and controls. Rendered digit widths were measured individually and were equal in both engines; the complete values and metrics are in [checks.json](checks.json).

## Actual verification

**28 checks pass; no page errors were observed.** Tests used the already installed Playwright package with Chromium **153.0.8010.12** and WebKit **26.6**. Run the retained checks with `node output/verify.mjs` from the fixture root.

- Initial selection, five pointer switching/reversal cycles per engine, and stable geometry while selected and held down.
- Native keyboard traversal, visible focus, Space activation, Enter activation, and reversal in both engines.
- Widths of 320, 375, 440, 768, and 1000 CSS pixels with no horizontal overflow.
- Longer route/field strings and a four-digit parcel count at 320 pixels, with no label/value overlap.
- Touch-emulated switching/reversal at 375 × 667 CSS pixels and device pixel ratio 2, in both engines.
- Reduced-motion switching, and readable initial route content with JavaScript disabled.
- Chromium forced-colors rendering, with the selection underline and independent focus outline retained.

An initial WebKit keyboard check expected plain Tab to focus buttons. It failed because this macOS WebKit configuration skips native buttons on plain Tab. A direct comparison confirmed identical behavior in `before/` and `work/`; Option+Tab reaches both controls, and native Space/Enter activation passes. The initial result is preserved in [initial-checks.json](initial-checks.json), and the baseline comparison is recorded in the final checks.

## Visual evidence

Screenshots were inspected at the rendered interface size. Before/after desktop captures use the same 1000 × 700 CSS-pixel viewport at DPR 1; narrow captures use the same 320 × 640 viewport at DPR 1. The touch captures are native DPR 2 images, not enlarged DPR 1 images.

| Evidence | Before | After |
| --- | --- | --- |
| Desktop | [Baseline](before-desktop.png) | [Chromium](after-desktop-chromium.png), [WebKit](after-desktop-webkit.png) |
| Narrow | [Baseline](before-mobile.png) | [Chromium](after-mobile-chromium.png), [WebKit](after-mobile-webkit.png) |
| Keyboard / selected | — | [Chromium](after-keyboard-chromium.png), [WebKit](after-keyboard-webkit.png) |
| Touch at DPR 2 | — | [Chromium](after-touch-dpr2-chromium.png), [WebKit](after-touch-dpr2-webkit.png) |
| Longer content | — | [Chromium](after-long-content-chromium.png), [WebKit](after-long-content-webkit.png) |
| Forced colors | — | [Chromium](after-forced-colors.png) |

The retained [comparison page](comparison.html) puts the matched screenshots together. It combines the interface changes and does not claim to isolate a single visual variable.

## Limits

The fixture's view switching changes the selected button state only; it supplies no alternate route panel or live dispatch data. That behavior is preserved. Without JavaScript the initial route stays readable, but switching remains unavailable as in the baseline. Physical mobile devices, Firefox, other operating-system fonts, screen readers, browser zoom, and WebKit forced colors were not tested. No fractional-pixel contour treatment or animation was introduced. File hashes are recorded in [file-hashes.json](file-hashes.json).
