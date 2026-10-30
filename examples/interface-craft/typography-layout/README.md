# Type, controls and row rhythm

Build with `bun run build`, serve with `bun run demo`, then open `typography-layout.html`. The English UI switches five fixed language samples, appearance, available measure, text size and guides. `typography-layout-studies.html` renders six explanatory plates from the same functions. These are private specimen renderers, not public component APIs.

## Controlled comparisons

- C1 holds 24px type / 40px line height across locale-appropriate fonts. The em square is a frame guide, not a measured ink bounding box. Detail geometry is enlarged 1.5×.
- C2 has two independent pairs: `text-autospace` only, then `text-spacing-trim` only. The live page reports syntax support. Unsupported declarations keep normal layout; the export records its engine.
- C3 holds each pair's string, font and 240px width. Chinese compares `break-all` / `normal`, Japanese `normal` / `strict`, Korean `normal` / `keep-all`. A rule need not change every string's breaks.
- R1 holds a 36px button and 24px text line. Margins produce a 24px flex footprint; translation retains 36px. The actual target stays 36px and the stage reserves room for its extension. Detail geometry is enlarged 1.6×.
- R2 changes only action-cell block padding, 8px to 2px. The control stays 36px; the native table row changes from 52px to 40px. Inset-shadow rules add no layout thickness. Detail geometry is enlarged 1.5×.
- R3 retains the sentence and inline control. Baseline/line-box participation is not promised to give identical heights in other fonts. Detail geometry is enlarged 1.6×.

The bounded rows include avatars, thumbnails, icons, badges, counts, buttons, checkboxes, radios, switches, fields and selects. Inline samples add images, icons, code and superscripts. Controls operate locally; action feedback preserves labels and geometry. Touch uses larger targets/rows instead of compact bleed. Text enlargement grows rows. Without JavaScript, settings are disabled and comparisons remain readable.

## Reading controls

The final live section carries findings from the aron.tw integration into a portable specimen. It does not change the six exported diagrams. With fixed text/font/measure, compare a 44px minimum in a heading's layout with an independent 44px anchor around a natural 30px line. The following paragraph leaves room for the target; wrapped or enlarged text can grow. Anchor links navigate to the command example even without JavaScript.

A second pair compares an inline result arrow with a separate first-line icon column. The latter reserves text width rather than following the last line. The command's copy button is visible without a discovery tap on no-hover devices, revealed on hover or keyboard focus otherwise, and hidden without JavaScript. A clipboard failure directs focus to the selectable command. Reduced motion removes arrow travel as well as its transition.

Run `bun run test:reading` for this section: Chromium/WebKit, five language samples, 320/390/1440px, light/dark and 100%/200% specimen text; actual extended target hit tests, first-line icon alignment, keyboard, ten emulated first-touch copy/failure checks, reduced motion and static fallback. Raw results and native-size captures are saved in ignored `artifacts/reading-controls/`. See the [integration record](../../../docs/verification/aron-site-2026-10-30.md).

## Fonts and ownership

CJK shards come from the article's pinned local Noto Sans TC/SC/JP/KR sources. Original URLs and hashes are in `fonts/SOURCES.json`, with four OFL notices. Selection covers the fixed samples, not arbitrary CJK input. Latin text uses the existing Geist; portraits and landscape are existing original assets.

After editing a fixed string, run `node scripts/prepare-typography-fonts.mjs <article-checkout>`. This development import selects local Unicode-range shards without downloads or new project dependencies. Normal builds need neither that checkout nor network access.

## Verification

`bun run test:typography` checks bounds, Chromium platform-font reports, five locales, three widths, two themes/text sizes, controls, keyboard/hover, emulated touch, extended hit testing and static fallback. `bun run capture:typography` exports six 2880×2000 PNG/WebP boards and provenance under ignored `artifacts/typography-layout`.

Touch and density are emulated, not physical-device checks. The text-size control is not OS/browser zoom. Enlarged diagrams are separate from saved native-size row screenshots. Engine differences are recorded.
