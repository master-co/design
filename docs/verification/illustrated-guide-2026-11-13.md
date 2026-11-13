# Illustrated design guide — 2026-11-13

The guide now contains 51 canonical pages, 47 static figures, eight interactive labs, the retained density specimen and three complete local task studies. All 59 teaching presentations use the shared Demo tray: title in the tray head, content in its sheet stage and explanation in its caption. Static figures also include a native Text description disclosure.

## Delivered scope

| Area | Result |
| --- | --- |
| Entry | Overview, principles and accessibility; reading paths for designing a page, completing a flow and reviewing an interface |
| Foundations | Twelve topics: the original eight expanded, plus layout, content, localization and data visualization |
| Components | Seven groups with anatomy, selection tradeoffs and interaction distinctions |
| Patterns | Fourteen topics: the original six expanded, plus onboarding, access, editing, files, collections, empty states, notifications and help |
| Craft | Twelve topics: the original ten expanded, plus focus/input and scrolling/overflow |
| Labs | Color compositing; density/targets; circular inset/painted ring; real mixed-script text; concurrent states/focus; responsive regions; stale asynchronous responses; interrupted/reduced motion |
| Complete studies | Reading/search/history; form entry/review/correction/failure/completion; collection selection/editing/partial batch/retry/undo |

The [source map](../sources.md#illustrated-web-guideline--2026-11-13) distinguishes normative standards, platform and design-system guidance, and original design judgments. No third-party illustration or visual style was copied. Existing craft specimens and their historical evidence remain intact.

## Content and package boundaries

The Markdown in `skills/master-design/references/` remains the knowledge source. `site/figures/catalog.mjs` associates stable presentation IDs with source files and section headings. Preparation parses headings and inserts site components after the matching section, without putting component syntax or internal asset paths in the public Markdown. Missing sources, headings and renderers fail validation; duplicate IDs are rejected.

Search and downloadable Markdown retain the canonical knowledge. The site tests compare generated adapters with the canonical transformation and verify the downloadable source and search entries. Every static internal link and fragment in the built site resolves.

The internal `.agents/skills/master-design-doc-illustrations` skill is marked `metadata.internal: true`. It covers explanation, controlled variables, the required shared tray, integration and verification. Public routing and capability descriptions do not advertise illustration authoring. The public entry remains concise and references are loaded by topic.

Actual `skills@1.4.9` default installation and explicit `--skill master-design` installation each produced one public skill in temporary projects. The detached installation contained 54 files, byte-equal to the public source, without authoring tools. Local reference containment and symlink checks protect portability. Tests exercised the release's existing public-subtree archive and a separate archive of the edited working files using an isolated Git tree; no commit or real-index modification was made. Both archives excluded internal tooling.

## Observed verification

Development used Bun 1.4.4 and Node 24.20.0. Browser tests used Chromium 153.0.8010.12 and WebKit 26.6. Dependencies and their lockfile were unchanged; site presentation uses `@master/internal-site@0.2.12` and `@master/ui@0.0.5`.

| Check | Observed result |
| --- | --- |
| `bun run check` | 66 tests passed, including source, package, state-model and site generation checks |
| `bun run build` | Standalone craft and workspace studies built |
| `bun run check:site` | Zero Astro/Svelte errors or warnings; eight site tests passed |
| `bun run build:site` | 51 guide pages and a 404 page built, with sitemap |
| `bun run test:site` | Both browser engines passed existing shell/guide checks and the teaching checks described below |
| `bun run test:install` | Default discovery/install, named install and detached public package passed |
| Skill Creator `quick_validate.py` | Public and internal skills passed; Python dependency isolated under ignored artifacts |
| Existing craft regression | `test:avatars`, `test:typography`, `test:reading`, `test:dashboard`, `test:browser` and `test:native` passed; native suite covered ten engine/density combinations |
| Existing brand specimens | Copies under `artifacts/guide-forward` passed 28 brand and 31 near-white checks; historical evidence was not overwritten |

The teaching suite checks all 47 static figures at 1280px and 320px viewports, in light and dark appearance, in both engines: 376 individual figure captures. It checks content bounds, the shared tray/sheet structure and nonempty explanations. All labs and complete studies are also captured in those conditions. Representative geometry, form-flow and service pages have contextual viewport captures with the real header. Isolated figure captures hide fixed site chrome so it cannot cover the crop; the teaching content itself is not changed.

Behavior checks cover:

- Actual target dimensions and nonoverlap, circular inset CSS, color-pair calculations and reset.
- Long mixed-script text, RTL composition, responsive stacking and real section links.
- Selection with independent keyboard focus; Chromium forced colors.
- Stale-response rejection, failed requests, cancellation, preserved confirmed results and retry.
- Motion reversal and the system reduced-motion preference without making completion depend on animation.
- Reading search/filter URL state, no-match versus failure, retry, direct detail loading, section history, focus return and IME composition suppression.
- Multiple field errors, summary focus, retained values through review/editing, failed submission, retry, completion and deliberate discard.
- Collection mixed selection, criteria scope reset, stable sorting, edit/cancel/save, partial batch completion, retrying only failed items and undo.
- Held lab/service/workspace modules: readable SSR, disabled waiting controls, and a successful first operation after hydration. The existing density specimen's held-module check remains.
- No-JavaScript content, representative 200% root text sizing, first-touch form activation and native-size geometry at emulated DPR2.

Generated logs, reports and captures are under ignored `artifacts/`, principally `artifacts/site/report.json` and `artifacts/site/teaching/`. Some retained craft scripts keep their original specimen date in generated JSON; the suites were rerun in this session on November 13. No release or delivery script was changed, so no new deployment or manifest workflow was exercised.

After the final narrow-geometry correction, site type checking/build and the complete teaching suite were rerun with `SITE_TEST_SECTION=teaching bun run test:site`; that focused result is `artifacts/site/teaching-report.json`. The preceding full run retains the existing shell checks in `report.json`. Local bounds checks account for Master UI slider's intentional five-pixel thumb/focus bleed into stage padding while rejecting content that reaches the clipping edge.

## Visual and editorial judgments

The complete static figure set was reviewed in contact sheets, with representative figures and interactive frames inspected at their actual captured reading size in ordinary and narrow layouts and both themes. Checks led to these corrections:

- Reused the real shared Demo tray and sheet instead of maintaining a local outer frame. This matches the first-party UI/CSS document structure and the requested reference.
- Distinguished layout inset from painted inset with a separate outside-ring construction. Labels identify schematic dimensions rather than claiming measured magnification.
- Marked actual inline baselines in the mixed-script specimen instead of drawing a line at an arbitrary percentage of a box.
- Replaced misleading sequences with comparisons or branches: guide levels and recovery mechanisms are alternatives; uncertain asynchronous results and partial batch outcomes branch.
- Kept real sequences on one row or one vertical stack, so arrows do not imply an incorrect wrap order.
- Reserved the geometry lab’s horizontal margins inside its available width, preventing the shared sheet from clipping the narrow specimen. Teaching checks now inspect local content overflow as well as page overflow.
- Scoped stage-kind classes separately from inner drawing classes to prevent a target or chart specimen from accidentally sizing the entire stage.

The public guidance was also reviewed against two deliberately different existing specimens. Harbor Dispatch retains its teal/amber palette, Georgia headings, two-pixel outlines, four-pixel corners and compact controls. The near-white library specimen retains Arial, its explicitly opted-in surface treatment and larger controls. The guide's decisions concern seams, readable values, independent focus and state continuity; neither review calls for importing the other specimen's dimensions or materials. Their rerun checks are regression evidence, not a newly independent agent evaluation of the expanded skill.

Cross-topic review checked consistent distinctions between selected and focused, pending and confirmed, cancellation and undo, known failure and unknown outcome, layout and painted bounds, and site conventions versus consumer design choices. Component decisions link to complete patterns; recovery retains input and task context. Existing blanket claims about row-hover treatment and gradient interpolation were narrowed to their actual conditions.

## Limits and unchanged release state

Screen-reader walkthroughs and physical-device testing were not performed. Browser-emulated touch/DPR, synthetic IME events and a 200% root-font setting are not substitutes for hardware, an actual input-method session or OS/browser zoom. Forced-colors evidence is Chromium-only. These checks do not establish complete WCAG conformance or production backend behavior. The task examples use deterministic local data and simulated outcomes; reload persistence and external writes are intentionally absent.

The public skill version remains 0.3.2. The changelog has an Unreleased entry. No commit, push, publication, deployment, global skill installation or changes to other repositories were made.
