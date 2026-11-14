# Complete the Web interface design guidance

Historical record: the [2026-11-15 scope revision](verification/wcag-scope-2026-11-15.md) removes WCAG 2.2.2 guidance and the paused-update specimen. Coverage counts, planned requirements and results below describe the original audit or implementation, not the revised guide.

Implementation status: all 32 items are now implemented. See the [implementation and evidence record](verification/design-guide-expansion-2026-11-14.md) for actual results and the remaining real-AT/hardware verification limits. The text below preserves the original implementation specification.

Implementation plan based on the [2026-11-14 audit](verification/design-guideline-audit-2026-11-14.md). The user selected deeper coverage of the existing Web interface design remit, with necessary illustrations and behavioral verification. The audit and this plan are complete planning artifacts; the guidance and specimens described below are not implemented by this documentation change.

## Intended result

Close the audit's 32 work items without turning Master Design into a component library or a product-design operations manual. A reader or installed agent should be able to choose a reasonable approach, recognize when it does not apply, implement through the consumer project's existing system, and test the observable result.

Preserve the existing strengths: rendered craft, real fonts/scripts, stable state identity, whole-task recovery and portability. Keep the public entry concise, essential knowledge in reference Markdown, and teaching implementation outside the installed skill. Retain all existing research examples and their evidence.

Every admitted finding must have a canonical home and an acceptance scenario. The work packages below are an implementation sequence for one complete expansion, not optional later phases. No release, commit, push, deployment or global installation is included.

## Content architecture and public interfaces

Keep the existing six site categories and all 51 routes. Extend current references where they already own the decision. Add exactly these six focused references, resulting in 57 canonical pages:

| New reference under `skills/master-design/references/` | Public route | Purpose and required sections |
| --- | --- | --- |
| `foundations/media.md` | `/foundations/media` | **Media and alternatives:** choose the content role; provide appropriate alternatives; playback and ongoing content; sequences/carousels; verify. Own A05; cross-link images, motion and accessibility. |
| `components/disclosure.md` | `/components/disclosure` | **Disclosure and panels:** choose visible sections, disclosure, accordion, tabs or a page; define expansion/activation; preserve work and hidden-error access; verify. Own C03; navigation retains URL semantics and overlays retain modality. |
| `patterns/date-time.md` | `/patterns/date-time` | **Dates, times and ranges:** establish the temporal meaning; choose entry versus selection; explain format/zone/availability; preserve and validate input; acceptance scenario. Own C01. Numeric quantities remain in existing fields/selection guidance. |
| `patterns/large-collections.md` | `/patterns/large-collections` | **Large collections:** choose pagination/load-more/feed; preserve scope/context; handle loading and deletion; account for virtualization; acceptance scenario. Own P01; existing collections owns selection/bulk operations and ordering. |
| `patterns/privacy.md` | `/patterns/privacy` | **Privacy, consent and sharing:** explain necessary data; distinguish optional choices; identify audience and permission; preview/apply/revoke; acceptance scenario. Own P04. Avoid legal advice and authorization implementation. |
| `patterns/ai.md` | `/patterns/ai` | **AI-assisted interfaces:** explain capability and context; separate suggestion from commitment; preserve work during generation; handle limits/failure; acceptance scenario. Own P05. No model API, provider, orchestration or training instructions. |

Register the additions in `site/catalog.mjs`; add task-oriented routing in the existing `SKILL.md` table and overview. The public skill description retains its Web-interface remit and does not advertise research operations or documentation-illustration authoring. Route to media only for media work, AI only for an AI feature, and date/time only when temporal input/interpretation is relevant. Do not require all references to load for a spacing fix.

Public interfaces change only through new reference paths, routes and discoverable sections. No consumer component API, executable token, runtime dependency or backend schema is introduced. Keep existing reference paths and meaningful heading fragments. If a consolidation must change a heading, update the figure registry and legacy-anchor mapping together, preserving equivalent destinations. Generated MDX, navigation and search remain outputs of the existing adapter.

Use a lightweight authoring pattern for each substantive addition: **decision → applicable conditions → mechanism or example → counterexample → observable check**. This is an editorial test, not five mandatory headings on every page. Normative requirements identify their standard, level, applicability and exceptions; heuristics and specimen dimensions identify their limits. Cite primary sources near non-obvious claims and retain enough explanation for offline use.

## Work packages

### 1. Correct conflicting rules and establish ownership

Resolve R01–R04 before adding more prose:

- In sizing, responsive and states, permit coordinated visible control growth or recomposition when needed. Keep independent hit-target expansion as an option and retain approved-baseline preservation for tasks that require it. Explicitly reject overlapping invisible targets.
- Scope the texture advice to its original empty-stage recipe; teach interference and meaning checks rather than assigning all textures one purpose or renderer.
- Remove portable obligations derived from the companion article's accepted scope and the particular dashboard's coordinates. Preserve specimen dimensions, calculations, original examples and historical evidence in their appropriate authoring context.
- Keep foundation pages responsible for choosing a relationship and craft pages responsible for its mechanism. Consolidate repeated state, semantics and verification paragraphs while retaining anchors. Preserve the circular-corner limitations and actual-font numeric findings.

**Exit evidence:** read the detached skill without repository context; a dense control that legitimately grows remains acceptable; a deliberate texture does not trigger an unrelated redesign; the original dashboard baseline remains enforced by its existing tests.

### 2. Make visual judgment operational

Complete V01–V08:

- Put the three-edge embedded-control check in geometry, the three spacing relationships in spacing, and local viewport/ink corrections in typography. Cross-link related foundations instead of duplicating formulas.
- For icon/text alignment, establish geometry before optical comparison. Keep wrappers/targets independent from the shifted drawing; test baseline, visual center and container-edge alternatives against actual content. Do not introduce a global text-up or icon-offset token.
- Add qualified reading-measure guidance and explain `ch` versus visible characters. Cover paragraph rhythm and start alignment as reading decisions; retain script-specific wrapping. Numeric tables, code, short captions and display headings remain separate cases.
- Add optional squint/blur hierarchy diagnosis, image-role and image-background checks, and categorical/ordered/diverging data-color decisions. Keep qualitative judgments separate from calculated contrast or measured geometry.

**Exit evidence:** the same rule improves the specific defect while leaving a counterexample unchanged. A padded card with a smaller external gutter remains valid; a normalized icon receives no invented offset; a wide data table does not receive a prose measure cap.

### 3. Complete accessible component decisions

Complete A01–A06 and C01–C07:

- Expand the accessibility entry with concise, task-triggered routes for the 55 A/AA criteria. Keep the full coverage crosswalk in the audit, rather than making the entry a duplicate WCAG manual. Include exact text-spacing override checks where relevant, and distinguish 200% text resizing from reflow/zoom testing.
- Add hover/focus lifecycle, character-shortcut scope, pointer/gesture/motion alternatives, session timing and ongoing-update controls. Keep flashing examples textual or static. Media gets its own foundation so unrelated interface tasks do not load it.
- Add field-choice tables for remembered dates versus calendar availability, date-only versus instant/duration, approximate versus exact numeric input, and identifiers versus quantities. For values, preserve editable input and explain correction; for dates, show format and relevant zone/availability.
- Add the disclosure reference and extend grouped actions, searchable/multiple/tree selection, card/tag semantics and unavailable-state choices in their existing owners. Keep complete keyboard implementations in established native/library contracts and APG references; teach when each contract is appropriate.
- Cover recognition and predictable changes through concrete cases: retained prior answers, a branch that changes, a focused option that is not yet committed, and explanatory text available without hover.

**Exit evidence:** each new decision table has at least one positive and one negative example. Native-disabled, ARIA-disabled and read-only are not conflated; keyboard reorder is not mistaken for a single-pointer alternative; a transcript is not declared a universal replacement for captions.

### 4. Complete task-level coverage

Complete P01–P06:

- Add large-collection choice and state-restoration guidance. Distinguish paging from appending and both from virtualization. Explain reliable counts, selection scope, end-of-list access, browser find/printing limitations and lost focused records.
- Extend collections with reordering outcomes and a visible non-drag route. Extend forms with conditional branches, meaningful progress and correction from review. Keep existing retry/version logic intact.
- Add privacy/sharing and AI patterns as conditional references. Privacy examples use fictional people and local permission state. AI examples use deterministic text fixtures and local state transitions; generation never implies acceptance, saving or publication.
- Extend asynchronous/empty/feedback guidance for a failed optional region alongside useful primary content. Keep truthful progress and data freshness; do not prescribe arbitrary spinner durations or fake percentages.

**Exit evidence:** a failed next page preserves loaded records; branch changes exclude obsolete values from submission while retaining recoverable draft state; copying a link does not silently grant access; rejecting generated text preserves the original; a failed optional panel does not erase the task.

## Teaching artifacts and acceptance scenarios

Use the internal `master-design-doc-illustrations` workflow. Reuse `GuideFigure`, `StudyFrame` and the shared Demo tray. Register stable IDs against canonical headings in `site/figures/catalog.mjs`. Essential conclusions remain in ordinary Markdown, accessible without illustrations. Keep all new labels and authored reports in English; multilingual sample content is intentional test data.

The following is the required evidence set, not a target number of decorative figures. Existing labs/studies should be extended when the mechanism matches. Implement new substantial interactive specimens as dedicated Svelte components under `site/components/studies/`, registered through the existing preparation mechanism; do not expand a universal renderer with unrelated state machines. Shared pure fixture logic belongs in `site/studies/model.mjs` only where it is actually reused.

| Evidence ID | Artifact and controlled inputs | Acceptance and covered findings |
| --- | --- | --- |
| E01 | Extend the geometry lab with a generic field/end-action specimen. Use a borderless 40px shell and 32px action as one labeled specimen; compare end gaps of 8px and 4px with fixed 4px block gaps. The action clears local text. Keep the existing ring/radius lab intact and expose painted-edge measurements separately. | Detect 4/4/8 versus 4/4/4 without confusing shell padding with icon ink or target size. Include an attached full-height action as a valid different intention. Verify LTR/RTL, border/ring variants and target independence. V01. |
| E02 | Extend the spacing figure with a second construction: within-group gap 8, container padding 24, inter-card gutter 12. Keep content/type fixed. Provide a contrasting misgrouped label/input example. | The first construction is accepted despite `24 > 12`; the second shows the wrong association. Check ordinary/narrow wrapping and enclosure bounds. V02. |
| E03 | Add a native-rendered alignment study with the existing site font, a triangle, a balanced icon and an icon with internal whitespace. Show box guides separately from visible ink. Compare symmetric padding with a local correction; include leading/trailing and RTL modes. | The normalized icon is an unchanged control case. Text includes Latin descenders and mixed scripts. Offsets affect only the drawing, not target or layout bounds; no automated claim of optical superiority. V03–V04. |
| E04 | Extend typography with real paragraphs at short, moderate and long measures. Keep text/font/size constant; expose line-height separately. Include English, Traditional Chinese and mixed text, using existing licensed assets and fixtures. | Qualify the Latin range; show that declared `ch` is not a count of all rendered characters. Test fallback loading, 200% text, spacing overrides and narrow fit. Reading is judged at native size. V05. |
| E05 | Add a hierarchy comparison with an optional blur toggle over only the specimen, never its real controls or explanation. Include an image-background text example and a categorical/ordered color comparison with stable labels. These may be separate figures sharing a page, not one combined-variable comparison. | State which variable changes in each comparison. Normal-size text remains readable; crop changes are checked behind text; series identity survives reordering. No accessibility claims from grayscale/blur alone. V06–V08. |
| E06 | Extend the density lab with two valid modes: a fixed visible mark in an expanded target, and a coordinated larger control/row composition. Preserve the original fixed-mark case. | Both can satisfy the intended task; adjacent targets never overlap. Check actual click ownership, focus clearance, long labels and narrow widths. R01. |
| E07 | Add a focused interaction specimen containing a supplementary hover/focus explanation, an ordinary disclosure and a simple reorderable list with Move up/down controls. Keep these as separate labeled tasks; include shortcut enable/disable locally. | Hover content is dismissible/hoverable/persistent where applicable; disclosure retains focused input safely; reorder works without dragging using pointer and keyboard; character shortcuts do not intercept typing/IME. A02–A03, C03, P02. |
| E08 | Extend the service study with a remembered-date/booking decision example, an exact quantity field and a conditional branch. Use fixed local dates and explicit locale/zone labels, not today's date. Use native/Master UI-supported controls; do not build a new calendar library. | Preserve invalid text, unrelated values and review correction. Obsolete hidden-branch data is excluded from submission and recoverable if the user returns before completion. Test Enter, paste, long help, unavailable dates and changed branch progress. C01–C02, P03. |
| E09 | Extend reading/workspace studies with deterministic 24-record pagination/load-more variants and a failed next chunk. Keep existing four-record scenarios available unchanged. Add a regional failure switch. | Loaded records, focus, URL/Back context and selection identity survive failure/retry; no duplicate append; last-page deletion has a useful destination; optional panel failure leaves primary work usable. Test browser find/print limitations in a separate explanation rather than building a virtualization engine. P01, P06. |
| E10 | Add a local sharing study with Private, Named people and Anyone with the link audience choices. Use fictional recipients, explicit Apply/Cancel and separate Copy link; the copied URL is an `example.test` specimen. Simulate a failed apply and subsequent revocation. | Audience remains unchanged until Apply succeeds; copy status is not access status; cancel/failure preserve the prior confirmed audience. No external writes, account setup or real authorization claim. P04. |
| E11 | Add a deterministic AI edit study with original text, a separately rendered suggestion, manual Advance, Stop, Retry, Accept and Discard controls. Label simulated generation; no actual model call. | Stopping preserves partial output and original text; retry cannot overwrite newer manual edits; acceptance is explicit and undoable locally. Announce milestones rather than each token. No invented confidence/provenance. P05. |
| E12 | Add a media alternative decision figure and a benign local time-limit/auto-update specimen. The time limit advances only through explicit study controls; no flashing content or remote media. Include a static carousel-control sequence. | Explain caption/description/transcript applicability and audio controls. Demonstrate extending an expiring session and pausing updates independently from reduced motion. Do not claim actual media-player/AT validation from the schematic. A04–A05. |

C04–C07 and A01/A06 additionally require scenario-based review using existing native/library controls: split-action separation, slow-tab manual activation, multi-choice token removal, tree-versus-navigation selection, card secondary actions, and disabled/read-only/busy submission behavior. Prefer small focused fixtures under ignored artifacts for these checks; add a permanent site specimen only when the comparison teaches more than the decision table. No requirement to implement a full new toolbar, tree, rich editor or widget library.

Each evidence artifact records its linked finding IDs, source, named variable, unchanged controls, limitations and actual review. Use DOM/hit testing for layout/interaction, and native captures for painted geometry. Optical judgment remains a reviewed observation, not a pixel-difference score.

## Verification and completion

### Automated and rendered checks

Use Bun 1.4.4 and Node 24. The audit environment has Node 24.20.0 available even though its default `node` is a different major; explicitly select the repository runtime for scripts.

1. Run `bun run check` for every completed integration. Validate package boundaries, source links, metadata, types, existing data logic and new meaningful state invariants.
2. Run `bun run test:install` after public reference/routing changes. Test a detached public package and ordinary named installation; never install globally as part of verification.
3. Run `bun run check:site`, `bun run build:site` and `bun run test:site` for canonical/site integration. Verify routes, preserved fragments, figure registration, search entries and byte-equivalent downloadable Markdown.
4. Extend the existing teaching checks for E01–E12. Cover Chromium/WebKit, light/dark, 320px and ordinary reading width, long content and relevant LTR/RTL cases. Inspect native captures; passing bounds alone is insufficient.
5. For geometry/type changes run the affected native/typography/avatar/dashboard suites. Use relevant 1×/2× and fractional densities; preserve existing original dashboard and avatar baselines. Run interaction suites for modified reading/service/workspace flows. Do not regenerate every unrelated historical image.
6. Test state invariants rather than prose headings: branch submission excludes inactive values; load-more retry cannot duplicate records; audience remains confirmed until success; a stale generation result cannot replace newer work. Use controlled failure injection and verify that intentional defects are detected.
7. Run retained `bun run test:forward` as regression evidence, explicitly identifying its frozen fixtures. It does not count as a fresh evaluation of the expanded skill.

No new test should assert that a subjective offset is universally “correct,” that a fixed line measure is always required, or that a particular wording must appear. Existing shared-site and UI packages retain ownership of their APIs and presentation; no dependency upgrade is planned. Delivery workflows/scripts are unchanged, so delivery-specific work is outside this plan unless a later implementation actually touches them.

### Human and independent behavioral review

Perform fresh isolated skill evaluations, using the skill-creator forward-test method. Evaluators receive the frozen candidate skill, a realistic request and raw fixtures, without this audit's diagnosis or expected repair list. Generated work stays under ignored artifacts. Use these tasks:

- **Dense branded field:** repair an inset defect while preserving a normalized icon, a valid compact target and the existing brand.
- **Editorial reading:** improve an excessively long prose measure while preserving headings, code blocks, a deliberately wide data table and CJK content.
- **Service entry:** choose appropriate remembered-date and exact-number controls, handle a changed branch and preserve failed input.
- **Workspace collection:** keep paging/selection identity, provide non-drag reorder and preserve work during a regional failure.
- **Contextual help:** fix hover/focus lifecycle and shortcut collisions without turning ordinary links into a menu.
- **Optional AI and sharing:** distinguish suggestion/application, draft/confirmed audience and copy-link/access outcomes using local fixtures.

Review the outcomes for correct diagnosis, useful implementation, non-regression, restraint on valid counterexamples and on-demand reference selection. Record the model/tool environment and exact artifact hashes; do not reuse historical measurements as new results. Evaluate narrow craft tasks without requiring all six new references to load.

For changed interaction patterns, perform actual screen-reader walkthroughs in a supported browser/AT combination where available, plus real touch/software-keyboard checks for temporal/numeric entry and reordered content. Record actual platform, version and inputs. If a required environment is unavailable, leave that acceptance item explicitly unverified; do not report the whole behavioral validation as complete or substitute an accessibility snapshot for speech output.

### Definition of done

- All 32 finding IDs are linked to final canonical text and appropriate evidence; every N/P accessibility item has an explicit trigger and destination, without claiming automatic conformance.
- Six new references and their routes are present; existing routes/meaningful fragments, installed links, source-derived search and downloads remain valid.
- E01–E12 and the focused component scenarios have actual results, including counterexamples and documented limitations. Historical examples/evidence remain intact.
- The entry remains a concise router; neither internal authoring capability nor site code/assets enters the public skill. Optional topics do not become required reading for unrelated tasks.
- Source notes distinguish standards, platform conventions, heuristics and first-party judgment. No unsupported Apple/Material four-pixel rule, universal padding inequality, universal icon offset or text-up shift remains.
- Repository/site/install checks pass; fresh evaluation results and unverified AT/hardware conditions are accurately recorded in `docs/verification/`.
- Add an Unreleased changelog description for the eventual public guidance changes, but leave `metadata.version` unchanged. Release level and publication remain the owner's decision.

## Assumptions and exclusions

The implementation preserves consumer frameworks, fonts, brands and density; uses the current shared site/UI dependencies; contains only local simulated task data; and adds no external service writes. Original source assets remain under their existing provenance and licenses. New explanatory prose and diagrams are original, not copied third-party instruction sets or illustrations.

The user requested a complete audit and incorporation plan in the existing remit. This plan does not repair the original date picker in another repository, introduce a personal style profile, or claim that every specialist domain needs a dedicated chapter. It defines a complete implementation for the admitted corpus while keeping future additions tied to demonstrated decisions and failures.
