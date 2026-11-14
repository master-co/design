# Web interface expansion — implementation and evidence

Implemented the [32-item audit](design-guideline-audit-2026-11-14.md) and its [incorporation plan](../design-guide-expansion-plan.md), preserving the existing Web-interface remit and original examples. All 32 items have a canonical destination and an implementation or editorial result below. The available automated/browser verification passed. Real assistive-technology speech and physical-device walkthroughs remain unverified; this report is not a conformance declaration.

## Delivered structure

The guide now has **57 canonical references**, adding media, disclosure, dates/times, large collections, privacy/sharing and AI-assisted interfaces. The portable entry remains a task router; media and AI are not mandatory reading for a spacing repair. Search, navigation, generated adapters and Markdown downloads come from the same canonical sources. Installation includes one public skill and excludes the internal illustration skill.

The site retains its original **47 static figures, eight labs, density preview and three task studies**. This expansion adds two static figures and 16 registered interactive presentations using 11 focused Svelte study components; repeated presentations reuse the same mechanism in relevant task chapters. The density lab gains a coordinated-growth mode. Original four-record journeys remain unchanged; larger collections and branching entry are separate adjacent specimens. All presentations use the existing shared Demo tray, theme and Master UI controls.

No dependencies, executable consumer tokens, component APIs or deployment configuration changed. This implementation verification was completed before release preparation, with `metadata.version` at `0.3.4` and an Unreleased changelog entry. The retained runtime manifest records that pre-release snapshot. At that point no commit, push, release, global skill installation or external service write had been performed.

## All 32 items

Paths in this table point to the canonical public knowledge. E01–E12 refer to the teaching specifications in the plan; the evidence column names actual implemented checks rather than planned activity.

| ID | Canonical result | Evidence and scope |
| --- | --- | --- |
| V01 | [Embedded end-control check](../../skills/master-design/references/geometry.md#check-an-embedded-end-control) | E01: rendered 4/4/8 negative case and 4/4/4 case, LTR/RTL, physical border/ring accounting, clear/reset and native-density captures. Full-height attached action remains a valid counterexample. |
| V02 | [Three spacing relationships](../../skills/master-design/references/foundations/spacing.md#distinguish-three-distances) | E02: actual 8px gaps, 24px padding and 12px gutter; separate incorrect/correct label association. Enclosure padding larger than gutter is accepted. |
| V03 | [Local icon compensation](../../skills/master-design/references/typography.md#correct-a-specific-optical-imbalance) | E03: viewport/ink distinction, leading/trailing and RTL comparison; balanced asset bounds unchanged. |
| V04 | [Optical alignment procedure](../../skills/master-design/references/typography.md#correct-a-specific-optical-imbalance) | E03: triangle, balanced and internally padded glyphs with actual Latin/CJK text. Scope of the correction is measured; optical preference is judged, not asserted by a pixel score. |
| V05 | [Reading measure](../../skills/master-design/references/foundations/typography.md#choose-a-reading-measure) | E04: same paragraphs at different measures, independent line-height choice, CJK, font-resource failure and enlarged-text/spacing checks. Editorial forward task retained wide data and literal code. |
| V06 | [Coarse hierarchy diagnosis](../../skills/master-design/references/evidence.md#diagnose-hierarchy-at-coarse-scale) | E05: blur applies only to the specimen, image removal retains its footprint, normal-size controls remain readable. No usability or contrast claim from blur. |
| V07 | [Image roles and overlaid text](../../skills/master-design/references/images.md#match-the-alternative-to-the-role) | E05: original schematic image, changing crop, optional stable text backing; informative/action/complex alternatives and real-text preference are in Markdown. Unbacked mode is a comparison, not an approved contrast pair. |
| V08 | [Meaningful encoding](../../skills/master-design/references/foundations/data-visualization.md#keep-encoding-tied-to-meaning) | E05: identity-bound categorical tones, ordered magnitude, diverging midpoint, one-category and missing-value controls. Reordering preserves assigned category tones; labels/units remain explicit. |
| A01 | [Feature-triggered accessibility routes](../../skills/master-design/references/accessibility.md#route-checks-by-the-actual-feature) | All previously partial/absent audit triggers have destinations; see the crosswalk below. Existing site checks verify skip/focus, navigation, reflow and search. No claim of all-criterion product conformance. |
| A02 | [Hover/focus lifecycle](../../skills/master-design/references/components/overlays.md#keep-hover-content-reachable) | E07: pointer travel, focus opening, Escape, dismissal and trigger focus in both engines. A WebKit pointer/focus interaction was found and fixed. Interactive help uses disclosure semantics. |
| A03 | [Complete input alternatives](../../skills/master-design/references/focus.md#offer-complete-alternatives) | E07: optional scoped shortcut excludes fields/composition; Move controls work with keyboard and pointer. Gesture/motion-actuation conditions are explicit; no unnecessary gesture engine was added. |
| A04 | [Preference, time and ongoing content](../../skills/master-design/references/foundations/motion.md#separate-preference-time-and-ongoing-content) | E12: warning, ten extensions, retained draft, pause independent from clock/reduced motion. Flashing rules are textual; no hazardous specimen. |
| A05 | [Media foundation](../../skills/master-design/references/foundations/media.md) | E12 and media decision figure: captions/description/transcript distinctions, manual sequence and playback conditions. No actual player, caption-quality or AT speech certification is claimed. |
| A06 | [Recognition and predictable choices](../../skills/master-design/references/foundations/content.md#support-recognition-and-predictable-choices) | E08 and component specimen retain context, instructions and panel edits; focus-only movement does not activate a delayed tab. COGA remains supplemental. |
| C01 | [Temporal meaning and entry](../../skills/master-design/references/patterns/date-time.md) | E08: remembered date, availability, excluded checkout endpoint, explicit zone interpretation, invalid-date retention and zone change without changing the civil date. Native/software-keyboard behavior on physical devices remains unverified. |
| C02 | [Value contracts](../../skills/master-design/references/components/forms.md#choose-the-value-contract) | E08: exact whole quantity, rejected out-of-range value retained for correction, no clamping. General text explains identifiers, approximate adjustments, decimal/negative values and editable intermediates. |
| C03 | [Disclosure and panels](../../skills/master-design/references/components/disclosure.md) | E07 native disclosure preserves edits; component specimen tests manual activation of a delayed panel and retained input. Choice includes visible sections and separate pages. |
| C04 | [Action groups](../../skills/master-design/references/components/actions.md#compose-action-groups) | Component specimen separates Save from an alternative action and retains ordinary disclosure/link navigation. Full toolbar/menu contracts are routed to established implementations/APG rather than recreated. |
| C05 | [Search, multiple values and hierarchy](../../skills/master-design/references/components/selection.md#search-multiple-values-and-hierarchy) | Native multiple-choice/removal specimen with focus recovery; ordinary nested navigation remains disclosure, not an invented tree. Query/active/committed distinctions and remote lookup failure are explicit guidance, not a claim to have built/tested a new combobox. |
| C06 | [Card semantics](../../skills/master-design/references/components/data-display.md#give-cards-their-actual-semantics) | Component specimen keeps a real heading link, selectable text and a distinct secondary action. Secondary action does not navigate. |
| C07 | [Unavailable-state contracts](../../skills/master-design/references/components/actions.md#explain-unavailable-actions) | Browser form includes read-only value and excludes native-disabled value; ARIA-disabled manually suppresses activation; busy has a separate resolution. Reading exposure requires actual AT verification. |
| P01 | [Large collections](../../skills/master-design/references/patterns/large-collections.md) | E09: 24 records, paging/append, URL/Back and focus, selection across pages, failed chunk/retry and last-page deletion. Current-render-only find/print limitations are stated. |
| P02 | [Reordering](../../skills/master-design/references/patterns/collections.md#reorder-without-losing-identity) | E07 named single-pointer and keyboard moves retain item focus; independent collection evaluation also exercises drag, sort/manual separation and undo. |
| P03 | [Changing form branches](../../skills/master-design/references/patterns/forms.md#preserve-work-through-changing-branches) | E08 excludes inactive address while preserving its draft, returns from review, retains invalid values and survives failure/retry. Mutation verification rejects hidden-branch submission. |
| P04 | [Privacy and sharing](../../skills/master-design/references/patterns/privacy.md) | E10 separates draft audience, confirmed audience, copy and revocation. Cancellation/failure preserve confirmed access; copy never changes it. Local simulation is explicit. |
| P05 | [AI interfaces](../../skills/master-design/references/patterns/ai.md) | E11 stop/partial/retry, separate suggestion, explicit acceptance, stale-result rejection, discard and undo. A later manual edit invalidates acceptance undo; no model or publication operation exists. |
| P06 | [Regional failure](../../skills/master-design/references/patterns/async.md#limit-failure-to-its-actual-scope) | E09 optional summary failure leaves records usable; failed append preserves loaded records and selected identities. Existing honest progress guidance retained. |
| R01 | [Contextual density adaptation](../../skills/master-design/references/foundations/sizing.md#adapt-to-input-and-content) | E06 permits coordinated visible growth alongside independent target expansion. Original fixed-mark mode and dashboard baselines pass. |
| R02 | [Scoped texture recipe](../../skills/master-design/references/surfaces.md#textures) | Removed universal empty-space meaning, renderer mandate and under-content prohibition; replaced with role/interference/contrast/native checks. Existing texture artwork untouched. |
| R03 | [Portable materials](../../skills/master-design/references/materials.md) and [avatar geometry](../../skills/master-design/references/avatar-stacks.md) | Removed obligations based on accepted article scope or an unidentified dashboard. Useful specimen math remains; original D22/O5 centers/columns are still enforced by repository dashboard/avatar tests. |
| R04 | [Progressive routing](../../skills/master-design/SKILL.md) | Six conditional routes; one owner for state, spacing, optical and timing contracts with cross-links. Consolidated repeated accessibility review instructions while retaining headings. All existing route/fragment checks passed. |
| R05 | [Useful restraint and evidence](../../skills/master-design/references/evidence.md#check-useful-restraint) | Six fresh blind tasks, deliberate counterexamples, semantic mutation checks and separate measurement/judgment/AT limitations. Historical forward tests are explicitly identified as regression evidence. |

## Accessibility content closure

The audit's C/P/N classifications describe its original baseline, not a score for this implementation. The 27 previously partial or absent items now have these explicit destinations. Existing C items remain available and were not rewritten into a duplicate WCAG manual.

| Original criterion IDs | Current guidance |
| --- | --- |
| 1.1.1, 1.4.5 | Image-role table, complex alternatives and real text versus images of text |
| 1.2.1–1.2.5 | Media content/alternative table, caption versus description versus transcript |
| 1.3.3, 1.3.4, 2.4.1, 2.4.5 | Feature routes for sensory instructions, orientation, bypass and multiple locating methods |
| 1.3.5 | Applicable personal-input purposes and autocomplete, in fields and accessibility |
| 1.4.2, 2.2.1, 2.2.2, 2.3.1 | Distinct audio, content time-limit, ongoing-update and flashing conditions |
| 1.4.12 | Exact applicable override values and separation of text growth from browser zoom |
| 1.4.13 | Dismissible/hoverable/persistent content and exceptions |
| 2.1.4, 2.5.1, 2.5.4, 2.5.7 | Character-shortcut scope and separate keyboard, pointer, gesture and motion alternatives |
| 3.2.1, 3.2.2 | No unexpected context change on focus/input; distinguish preview from commitment |
| 3.3.4, 3.3.7 | Consequence-specific review/correction/reversal and prior-answer reuse with exceptions |
| 3.3.8 | Cognitive-test alternatives/assistance/exceptions; password-manager and paste compatibility |

Normative claims keep their source, level and exceptions. The AAA measure mechanism is not presented as an AA default. The media schematic is not a tested player, and simulated timing is not server-session enforcement.

## Verification performed

Runtime: Bun **1.4.4**, repository scripts under Node **24.20.0**. Browser checks used Chromium **153.0.8010.12** and WebKit **26.6**. Temporary project installation used `skills@1.4.9`; the official skill validator ran in an ignored temporary Python environment with PyYAML, leaving repository/global dependencies unchanged.

- `bun run check`: packaging, canonical/local links, release metadata, delivery configuration, types and data tests.
- `bun run check:site`: Astro/Svelte diagnostics and all source/route/adapter/search/download/legacy-fragment checks.
- `bun run build:site`: complete static artifact; 57 canonical routes plus the site's additional generated page.
- `bun run test:site`: complete existing site suite plus the new expansion suite in both engines. All figure/study presentations were checked at 1280 and 320 CSS px, in light and dark appearances. Existing header/search/navigation and representative layout matrices also ran.
- `bun run test:install`: ordinary and named temporary installation, one public skill, 60 files, byte comparison with source and detached readability.
- `bun run test:native`, `test:typography`, `test:avatars`, `test:dashboard`: retained craft and approved-layout regressions. Native raster suite passed all ten engine/density combinations. New inset/alignment specimens additionally have unresampled 1×, 1.25× and 2× captures.
- `bun run test:forward`: both historical frozen tasks passed; these are retained regression fixtures, not the fresh evaluations below.
- Official `quick_validate.py`: public skill valid.
- Mutation verification: the normal data suite passes; five temporary defects are detected—hidden address submission, duplicate append, changed audience on failure, stale AI completion, and undo erasing later manual input.

The new suite also checks first-touch emulation, no-JavaScript content, independent pointer/keyboard moves, text-growth/spacing stress, two interrupted font requests with a readable layout fallback, and reset/recovery operations. Browser semantics and layout fit are narrower claims than actual speech output or usability.

A complete machine-readable summary, hashes and selected result records are retained in [the runtime manifest](runtime/expansion-2026-11-14.json). Current-run screenshots/logs and temporary installs remain under ignored `artifacts/`; no generated site adapter is authored or committed.

## Visual review and fixes found

Reviewed native inset/alignment captures and selected new tray captures at narrow dark and ordinary light sizes, including the nested-spacing construction, branch form, component contracts, larger collection, sharing, AI, timing and encoding specimens. Labels and controls wrap within their stage; fixed geometric specimens retain their named dimensions. Existing style, fonts and shared trays remain recognizable. The optical comparison exposes a judgment rather than declaring one correction universally superior.

WebKit revealed a genuine help lifecycle issue: pressing the dismiss button could move focus to an ancestor before click, closing the popup too early. Hover ownership is now tracked separately from focus ownership, so pointer travel and click completion keep the popup available; dismissal returns to its trigger. Both engines exercise the same sequence.

Review also added invalidation of AI acceptance undo after a later manual edit, preventing a stale undo action from deleting newer work. Its data regression and deliberately defective variant both verify that invariant. Early test-harness issues involving viewport-relative coordinates after scrolling and exact implicit-label matching were corrected without loosening the geometry/behavior assertions.

## Fresh independent skill evaluations

Three isolated evaluator agents each received two realistic requests, the frozen candidate skill and raw local HTML fixtures. They received neither the audit diagnosis nor an expected repair list. Output was limited to ignored fixture directories; there were no external service writes or installs. They loaded relevant references on demand. Their work was reviewed through reports, assertions, generated artifacts and selected screenshots.

| Task | Observed result | Actual verification |
| --- | --- | --- |
| Dense branded field | Equal embedded gaps, retained text-start padding, prevented shrinking of clear action; normalized icon pairing unchanged | Chromium LTR/RTL, keyboard/pointer, native/fractional size and text growth |
| Editorial reading | Scoped prose measure, preserved font/script and literal content; wide table/code remain locally reachable | Chromium actual-font evidence, exact copied command, 320px, spacing/text growth and keyboard scrolling |
| Service entry | Exact quantity, contextual date entry, conditional address exclusion, review/correction/failure/retry | Chromium simultaneous errors, retained draft, Enter, completed result and narrow/text-growth fit |
| Workspace collection | Finite append/retry, independent summary recovery, manual/sorted order, pointer/keyboard moves and undo | Chromium identity uniqueness, partial failure, drag/move, browser Back/focus and narrow fit |
| Contextual help | Native disclosure and visible storage instruction; ordinary typing cannot fire a global shortcut | Chromium/WebKit typing, keyboard/touch-emulated disclosure, synthetic IME and spacing overrides |
| AI and sharing | Separate original/suggestion/application/save, stale cancellation, local audience draft/confirmation and independent copying | Chromium/WebKit stop/edit/retry/undo, injected storage/clipboard failure and audience invariants |

The service evaluator kept a native birthday control and made the field optional because the fixture supplied no reason to require it; this is compatible with contextual choice rather than a universal calendar ban. The assistance evaluator added clearly scoped browser-local saving; this is its task choice, not a new requirement for all consumers.

Evaluator scripts used Node 24.22.1 where recorded; no model override was requested. The retained manifest hashes inputs, outputs, reports and the frozen skill. The final skill differs from the evaluation snapshot only by consolidating repeated accessibility review prose and linking state craft to its canonical unavailable-state table; those deltas were reviewed directly. These evaluations do not establish production usability or universal model performance.

## Remaining verification limits

No real screen-reader speech walkthrough, physical touch/software-keyboard session, real OS IME session, Firefox pass or native browser/OS zoom session was performed. Synthetic composition, touch emulation, accessibility semantics, root/specimen text enlargement and screenshots are not substitutes. Caption quality, an actual media player, real AI output, backend authorization, network/session enforcement and live publication are outside these local specimens.

Accordingly, implementation and available repository/browser verification are complete for all 32 admitted items; the plan's real AT/hardware acceptance conditions remain explicitly unverified. A future supported-device walkthrough should record its exact platform, actions, announcements and any resulting fixes without replacing this dated evidence.
