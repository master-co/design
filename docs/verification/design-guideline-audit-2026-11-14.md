# Web interface guideline audit — 2026-11-14

Master Design has broad coverage of interface design, but uneven decision depth. Its strongest material explains rendered geometry, mixed-script typography, state identity and recovery. The main opportunity is to connect those mechanisms to more explicit selection criteria, counterexamples and verification scenarios. Adding every component name from another design system would not solve that problem.

This review identifies **32 work items**: eight visual-foundation refinements, six accessibility refinements, seven component-decision refinements, six task-pattern refinements and five editorial/evidence corrections. These are work packages, not 32 absent subjects or 32 product defects. Some extend already useful guidance; others correct overly broad instructions. The proposed implementation is in the [expansion plan](../design-guide-expansion-plan.md). The [source register](design-guideline-sources-2026-11-14.md) records the external comparison and its limits.

## Scope, baseline and method

- Approved scope: practical **Web interface design**, across consumer brands, frameworks and densities. Include foundations, component choice, assembled tasks, accessibility, craft and verification. Exclude product strategy, research operations, organizational design-system governance, native-platform implementation and backend protocols.
- Baseline: commit `efa335e5e6678993fc40614e9451a105920b4106`; public skill version `0.3.4`. The working tree was clean when inspection began.
- Read the entry skill and all **51 canonical reference files**, plus the source register, contribution rules, illustration skill, route/figure catalogs, representative renderers, study models and validation scripts.
- Current presentation inventory: **47 static figures, eight labs, one density preview and three complete task studies**. These counts come from the catalogs, not an estimate of visible screenshots.
- Compare selected official material from Apple HIG, Material 3, Fluent 2, Spectrum, Carbon, Atlassian, Ant Design, GOV.UK, USWDS, Primer and Shopify/Polaris. Use W3C/WHATWG for web requirements and semantics, and NN/g and Microsoft HAX for additional judgment methods.
- Review each candidate against four questions: Is the decision relevant here? Is it already explained? Does the proposed addition change an observable choice or check? Can it remain useful without importing a brand, component API or external article?

“Covered” below means that the current text supports the named decision. It does not mean that all implementations pass, that the complete external guideline was reproduced, or that users have validated the advice. The external comparison is a dated, representative corpus, not a claim to have read every page of every design system. All 51 local references were reviewed.

The original date-picker implementation and its approved visual baseline were not supplied to this review. The quoted 4px observation is treated as a reported case, not a measurement reproduced here.

## Assessment of the six proposed gaps

| Proposal | Current evidence | Decision |
| --- | --- | --- |
| Equal inset around an embedded end control | `geometry.md` distinguishes painted/layout edges and even concentric inset; `states.md` mentions a track and insert. Neither gives a practical three-edge check for a trailing button. | **Add an explicit conditional check (V01).** When a button is presented as an evenly inset insert, compare its top, bottom and adjacent end gaps from the same named boundaries. Do not require all four sides of a text field to have identical padding. A text start, separator, open-ended toolbar or full-height attached action can legitimately differ. |
| Internal spacing must be smaller than external spacing | `foundations/spacing.md` already says within-group gaps are smaller than between-group gaps and separately discusses container padding. `geometry.md` explicitly allows a snug shell around generous content whitespace. | **Clarify the three relationships (V02), not a universal inequality.** Compare sibling gaps within a group, the padding that encloses it and separation from another group. A padded card may have more internal whitespace than the gutter to its neighbor. The proposed blanket rule would misdiagnose that valid composition. |
| Icon-side padding must be smaller than text-side padding | `typography.md`, “Letters and icons,” already names icon-side padding corrections and limits them to the pairing. Icon whitespace is also covered in foundations. | **Expand the method (V03).** Measure the asset viewport and visible drawing before changing padding. A pre-normalized icon may need no correction; a trailing icon changes the relevant logical side. 12/16 is a possible specimen, not a required pair. |
| Optical centering is only named | `typography.md` already discusses visible bounds, cap height, baseline, local nudges and selecting an alignment reference; layout distinguishes baseline and optical alignment. | **Make it demonstrable (V04).** The gap is an actionable comparison, not the absence of the concept. Compare a triangle, balanced glyph and real text with fixed boxes. Do not prescribe an upward translation for every text label or a rightward correction for every play icon. |
| Reading line length is completely absent | Foundations already mention controlled measure and sustained reading, but supply no starting range, unit caveat or way to evaluate it. | **Add calibrated guidance (V05).** A Latin prose starting range around 45–75 characters is a heuristic, not an accessibility requirement. USWDS currently describes 45–90 and a target near 66. CJK and mixed scripts need actual samples, not an automatic half-width conversion. |
| Squint test is missing | Evidence guidance distinguishes measurement from judgment, but has no coarse hierarchy diagnostic. | **Add as an optional heuristic (V06).** Squinting or a temporary blurred preview can reveal dominant masses. Follow it with normal-size reading and interaction checks; it cannot measure comprehension, contrast compliance or accessible operation. |

The examined Apple layout/buttons and Material spacing/text-field guidance support contextual grouping, readable controls and adaptable dimensions. They do **not establish a universal four-pixel or equal-three-edge requirement** for every field action. Do not cite them as proof of that stronger claim. The inset recommendation is an explicit geometric design intention to verify locally. See [Apple layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Material spacing](https://m3.material.io/foundations/layout/grids-spacing/spacing) and [Material text fields](https://m3.material.io/components/text-fields/guidelines).

The line-length distinction matters: [USWDS typography](https://designsystem.digital.gov/components/typography/) gives contextual typesetting guidance. [WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html) is **AAA**, concerns availability of presentation adjustments, and includes an 80-character/40-CJK condition; it is not the guide's AA default. [NN/g's squint test](https://www.nngroup.com/videos/squint-test/) is a visual-review technique, not a user-study result.

## What should remain intact

Keep the existing separation of content, surface and hit target; concentric circular geometry and its qualifications; decimal alignment and actual-string measurement; CJK/IME/copy fidelity; concurrent state cues; interruption-aware motion; native semantics; focus recovery; useful URLs; explicit selection scope; stale-response rejection; draft/version identity; unknown remote outcomes; partial retry; durable recovery; and no-JavaScript reading.

The current pattern coverage is especially strong for asynchronous work, editing, files, empty states and bulk operations. These do not need new chapters simply because another library lists them. Likewise, a fixed grid base, one typeface, one palette, a universal radius family, glass styling and a copied token taxonomy are not missing foundations.

## Findings and admission decisions

**Extend** means useful coverage exists but a specific decision or test is missing. **Add** means a separately useful capability is absent. **Correct** means existing wording can cause the wrong choice. The IDs remain stable through implementation. Each item has one primary owner; cross-links should prevent duplicate instruction sets.

### Visual foundations and craft

| ID | Status and current location | Required change and observable acceptance |
| --- | --- | --- |
| V01 | Extend — `geometry.md`, “Measure the edges” and “Read the inset” | Define an embedded-control inset check using the shell's inner boundary and the insert's painted edge. Compare block-start, block-end and adjacent inline-end; account separately for borders/rings. A 4/4/8 specimen must reveal the asymmetry; a 4/4/4 specimen must demonstrate the intended even inset. Both remain locally chosen values. Include an intentionally different attached-action example so equality is not overgeneralized. |
| V02 | Extend — `foundations/spacing.md`, “Reconcile enclosure and rhythm” | Name within-group gap, enclosure padding and between-group separation. Use a label/input group and a padded card with a smaller outer gutter as positive examples. The reviewer must explain the grouping from content and boundaries rather than reject every `padding > gap` arrangement. [Fluent layout](https://fluent2.microsoft.design/layout), [Ant proximity](https://ant.design/docs/spec/proximity/). |
| V03 | Extend — `typography.md`, “Letters and icons”; `foundations/icons.md` | Explain viewport whitespace versus ink bounds, icon-to-label gap and outer padding. Prefer the existing icon system's normalization; apply a local logical-side correction only when needed. Test leading/trailing icons, RTL, an already-normalized asset and a narrow asymmetric asset. No globally negative icon margin. [Fluent layout](https://fluent2.microsoft.design/layout), [Atlassian iconography](https://atlassian.design/foundations/iconography/). |
| V04 | Extend — `typography.md`, “Compare metrics with the actual words” | Give a sequence: select box/baseline/visible reference, establish geometric alignment, inspect actual ink, compare a scoped correction, recheck other strings/states. Include Latin descenders, CJK and a triangle. Keep hit bounds unchanged by an optical glyph adjustment. Pixel measurements establish position; optical balance remains judgment. |
| V05 | Extend — `foundations/typography.md`, “Separate reading from scanning” | Add reading measure with a qualified Latin starting range, line-height/paragraph-rhythm interaction and start-aligned body-copy guidance. Explain that `ch` measures the zero advance, not arbitrary character count; evaluate CJK/mixed text in its actual font. Demonstrate short, moderate and long measures with identical prose. Distinguish titles, captions, code and data tables from sustained prose. [USWDS typography](https://designsystem.digital.gov/components/typography/). |
| V06 | Add method — `evidence.md`; cross-link from layout | Add squint/blur and imagery-removal checks as optional early diagnostics. State the intended primary content before the comparison. A busy image should not become the accidental focal point; normal-size labels and secondary actions must still be readable. Do not turn blurred-image salience into an automatic quality score. [NN/g squint test](https://www.nngroup.com/videos/squint-test/). |
| V07 | Extend — `foundations/icons.md`, `images.md`, `foundations/color.md` | Complete the image-role decision: decorative, identifying, functional, informative or complex. Add text-over-image and responsive crop checks where the crop changes the actual background behind text. Offer a separate text region or stable scrim when needed. A button image alternative describes the action; a complex illustration needs its conclusion in text. Preserve current image-edge craft. [WAI image decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/). |
| V08 | Extend — `foundations/data-visualization.md` | Explain categorical versus ordered color encoding, and diverging encoding around a meaningful midpoint. Keep category identity stable through filtering/reordering; expose units, legend and source context. Use the project's colors rather than importing a palette. Test a reordered series, one category, missing values and both themes. Existing scale/uncertainty guidance remains. [Carbon color palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes), [USWDS data visualization](https://designsystem.digital.gov/components/data-visualizations/). |

### Accessibility and inclusive interaction

| ID | Status and current location | Required change and observable acceptance |
| --- | --- | --- |
| A01 | Extend — `accessibility.md` | Add a trigger-based coverage map instead of calling a short checklist a complete baseline. Explicitly route repeated navigation to bypass mechanisms, page discovery to multiple ways, sensory instructions to redundant names, orientation restrictions to their applicability, and media to its own reference. Preserve criterion levels and exceptions. The appendix below supplies the content audit, not a certification. |
| A02 | Extend — `components/overlays.md`, “Manage focus and exit” | Explain dismissible, hoverable and persistent hover/focus content, including criterion exceptions. Explain why an interactive popup is not a tooltip. Verify Escape without moving focus, pointer travel onto the popup, narrow placement and first-touch access. [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html). |
| A03 | Extend — `focus.md`, “Preserve complete input” | Cover character-only shortcut opt-out/remapping/focus scope; avoid intercepting typing/IME and browser commands. Distinguish keyboard alternatives, single-pointer non-drag alternatives, multipoint/path gestures and motion-actuation alternatives. A keyboard-only reorder does not by itself satisfy the pointer alternative. [Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html), [motion actuation](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html). |
| A04 | Extend — `foundations/motion.md`, `patterns/access.md`, `patterns/notifications.md` | Distinguish motion preference from timed-task adjustment, auto-updating content controls, flashing limits and audio controls. Reduced motion is not a substitute for pause or an expiring-session extension. Include applicable exceptions and a benign simulation; do not create hazardous flashing demonstrations. [Timing](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), [pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [flashing](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html). |
| A05 | Add — new media foundation | Cover prerecorded/live media alternatives, captions, description, transcripts and accessible playback controls according to content and criterion applicability. Do not imply that a transcript always replaces captions or audio description. Include carousel/manual advance, pause and focus requirements when media is sequenced. [WAI media](https://www.w3.org/WAI/media/av/), [carousel tutorial](https://www.w3.org/WAI/tutorials/carousels/). |
| A06 | Extend — `foundations/content.md`, `components/selection.md`, `patterns/forms.md` | Make recognition, persistent instructions and predictable changes concrete: show relevant prior choices, keep prerequisites visible, avoid an unexpected navigation after selection, and explain specialist terms without erasing a domain's vocabulary. Test a returning person and a changed branch. Treat COGA recommendations as supplemental guidance, not extra AA criteria. [COGA](https://www.w3.org/TR/coga-usable/), [WCAG on input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html). |

### Component decisions

| ID | Status and current location | Required change and observable acceptance |
| --- | --- | --- |
| C01 | Extend; give a dedicated task reference — `components/forms.md`, `foundations/localization.md` | Distinguish remembered/copied dates from choosing available dates; typed entry from calendar selection; date-only values from instants and durations. State format, relevant zone and range semantics. Preserve invalid input and explain unavailable choices. Test a birthday, booking range, ambiguous numeric date and zone change. The current date-format row is not enough to choose a date interface. [GOV.UK dates](https://design-system.service.gov.uk/patterns/dates/), [USWDS date picker](https://designsystem.digital.gov/components/date-picker/). |
| C02 | Extend — `components/forms.md` and `components/selection.md` | Distinguish exact values, incrementable quantities, identifiers and approximate continuous adjustments. Explain when a slider needs exact entry and understandable units, bounds and increments. Preserve editable intermediates, cursor and locale input; do not silently clamp a consequential value. Test negative/decimal values, paste and out-of-range correction. [GOV.UK text input](https://design-system.service.gov.uk/components/text-input/), [APG slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/). |
| C03 | Extend; add a focused disclosure reference — navigation, overlays and onboarding | Choose ordinary visible sections, disclosure, accordion, tabs or another page based on comparison, length and frequency. Explain simultaneous expansion, retained edits, hidden-error reveal and automatic/manual tab activation. Keep essential sequential instructions visible. Test keyboard, a slow panel, Back/deep links where supported and print/find behavior rather than assuming hidden content is discoverable. [GOV.UK accordion](https://design-system.service.gov.uk/components/accordion/), [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). |
| C04 | Extend — `components/actions.md`, `components/overlays.md`, `focus.md` | Distinguish a plain action group, toolbar, menu and split action. A split button needs separate named operations; an arrow must not change the meaning of the primary action. Use composite keyboard navigation only when warranted, with a discoverable overflow route. Do not reproduce every APG key table. [APG toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). |
| C05 | Extend — `components/selection.md` | Complete searchable and hierarchical choices: typed query, active suggestion and committed value; known-option versus free-entry modes; multiple selected tokens with explicit removal; a nested disclosure list versus a true tree widget. Test no matches, remote failure, Escape, IME, token removal and stable selected identity. [APG combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [APG tree view](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). |
| C06 | Extend — `components/data-display.md` and `components/selection.md` | Clarify that a card is a container, a badge is often information, and a chip/tag may represent a value, destination or removable filter. Choose semantics from the action, not the silhouette. Ensure a stretched card link does not intercept selection or secondary controls. Test text selection, separate actions, keyboard and first touch. [USWDS cards](https://designsystem.digital.gov/components/card/). |
| C07 | Extend — `components/actions.md`, `components/forms.md`, `states.md` | Add a decision table for hidden, native-disabled, ARIA-disabled, read-only and busy states. Explain discoverability, submission and manual event suppression where applicable; a disabled tooltip cannot be the sole explanation. Verify pointer, keyboard, form submission and actual AT exposure. Do not copy a library's claim that all disabled controls disappear from screen-reader reading. [HTML disabled controls](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute), [ARIA disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled). |

### Task patterns

| ID | Status and current location | Required change and observable acceptance |
| --- | --- | --- |
| P01 | Extend; add a large-collections reference — data display, collections and scrolling | Choose pagination, explicit load-more, continuous feeds or virtualization by task. Explain reliable totals, reachable footer/end, URL/Back restoration, focus persistence and what browser find/printing cannot see in unmounted records. Avoid assigning feed or grid semantics solely for performance. Test a failed next page, retry without duplicates, removed last-page records and returning from a detail. [Primer pagination](https://primer.style/product/components/pagination/), [APG feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/). |
| P02 | Extend — `patterns/collections.md` and `focus.md` | Turn “provide a non-drag alternative” into an outcome contract: named item, destination/position, preview, commit, cancel, result announcement and undo where supported. Use move buttons or a destination chooser reachable by a single pointer, plus keyboard operation. Sorting and manual order must not silently compete. [Atlassian drag alternatives](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/), [WCAG dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html). |
| P03 | Extend — `patterns/forms.md` and service study | Explain conditional questions and branching progress. If an answer removes a branch, define which values remain recoverable and which are included in submission; do not silently submit hidden obsolete answers. Review links must return to the correct section and retain unrelated values. Do not claim a fixed total when the remaining path is unknown. [WAI multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/), [WCAG redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html). |
| P04 | Extend; add privacy/sharing pattern — principles and access | Extend minimum-data and in-context permission guidance to audience selection, private/shared/published states, optional choices, changed recipients, revocation and a readable consequence preview. Separate copy-link success from permission changes; a copied URL does not prove someone can open it. Keep real authorization and jurisdiction-specific policy outside the guide. [Apple privacy](https://developer.apple.com/design/human-interface-guidelines/privacy), [Ant decision neutrality](https://ant.design/docs/spec/contrast/). |
| P05 | Add conditional pattern — AI-assisted interfaces | Distinguish generated suggestions from approved/applied results; explain capabilities, context used, limitations and available provenance. Preserve original content through stop/retry/edit/reject/accept; avoid announcing every streamed token or inventing progress/confidence. Provide a normal workflow when AI is optional. Use deterministic local fixtures, never a model/backend dependency for the study. [Apple generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai), [Microsoft HAX](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/). |
| P06 | Extend — `patterns/async.md`, `patterns/empty.md`, `components/feedback.md` | Make regional failure and perceived performance explicit: preserve still-useful content, label stale versus fresh data, keep controls responsive, and limit loading replacement to the affected region. Avoid forced minimum spinner durations or fabricated progress. Test an optional panel failure alongside usable primary work, and distinguish static content from unavailable enhancement. [Primer degraded experiences](https://primer.style/product/ui-patterns/degraded-experiences/), [Primer loading](https://primer.style/product/ui-patterns/loading/). |

### Corrections, structure and evidence

| ID | Status and current location | Required change and observable acceptance |
| --- | --- | --- |
| R01 | Correct — `foundations/sizing.md`, `patterns/responsive.md`, `states.md` | Replace the categorical prohibition on changing visible control geometry for coarse pointers with a choice among preserved-mark target expansion, coordinated component growth and recomposition. Preserve the approved baseline when that is the task; do not make that task-specific constraint universal. Check target overlap and text growth in both preserved and enlarged variants. [Material button adaptation](https://m3.material.io/components/buttons/guidelines), [Apple layout](https://developer.apple.com/design/human-interface-guidelines/layout). |
| R02 | Correct — `surfaces.md`, “Textures” | Scope the empty-stage texture recipe. Textures can have other legitimate roles, including project branding or data encoding. Replace the universal meaning assignment, under-content ban and hard-stopped-gradient mandate with checks for interference, contrast, raster quality and redundant meaning. Preserve the original specimen and its evidence. |
| R03 | Correct — `materials.md` and `avatar-stacks.md` | Remove obligations based on the “accepted article scope” or preserving this repo's particular dashboard positions from portable instructions. Retain useful scoped examples and calculations. Move historical preservation requirements to authoring/evidence documentation. A detached skill must not need an unidentified dashboard baseline to make a decision. |
| R04 | Improve structure — foundations/craft pairs and repeated concluding sections | Give each decision one canonical owner; retain foundation-to-craft progression. Consolidate repetitions such as repeated native semantic selection or repeated state/recovery advice instead of appending another generic Review section. Preserve existing route/heading targets and figure insertions, using legacy anchors when headings must move. Do not merge all references into one mandatory read. |
| R05 | Extend evidence — entry skill, `evidence.md`, retained forward tests | Add task-triggered retrieval examples and new isolated behavioral evaluations. Existing frozen forward tests cover two early craft tasks, not every later pattern. Existing bounds tests verify fit, not optical correctness or usability. Add counterexamples that the skill should leave unchanged, and record which checks are automation, human judgment, screen-reader operation or hardware input. |

## Conflicts that must be resolved rather than averaged

| Apparent rule | Why copying it would be wrong here | Master Design decision |
| --- | --- | --- |
| One universal 4/8px spacing system | Fluent, Atlassian and Ant use different scales and exceptions. Their tokens are product choices. | Preserve project tokens; teach relationships and observable grouping. |
| Every icon button needs smaller leading padding | Asset viewports and optical normalization differ. Fluent explicitly accommodates icon whitespace in its scale. | Inspect visible geometry, then correct only the affected pairing. |
| 45–75 characters is the accessibility limit | Typesetting advice and AAA presentation customization are different; USWDS uses a broader range. | Qualify the heuristic; state the level and mechanism for standards claims. |
| Always disable incomplete forms or automatically clamp inputs | Spectrum gives creative-tool examples; silently changing an entered quantity can change a consequential transaction. | Explain local correctable errors; disable only with a clear, discoverable reason. Restrict automatic normalization to unambiguous changes and preserve intent. |
| Never wrap button labels or table statuses | Material and Ant document particular component conventions. A consumer's translated/enlarged text must still be usable. | First recompose or use supported variants; retain complete meaning and tested growth. |
| Always autosave, or always use a save bar | Shopify's admin deliberately favors its own explicit save workflow. | Keep the existing explicit/autosave/immediate decision model. Do not import a host-product API. |
| A disabled native control is absent from screen-reader reading | Library summaries sometimes conflate keyboard focus with accessibility-tree exposure. | Explain HTML/ARIA effects separately and test the actual supported browser/AT combination. |
| Any slow task should show determinate progress | Duration does not create a measurable denominator. | Retain honest indeterminate progress or a real measurable total. |
| Every completion moves focus to new content | Routine search/save updates can interrupt typing and reading if they take focus. | Preserve focus by default; move it for a deliberate task transition or a lost target. |
| A squint test proves a good hierarchy | Coarse salience cannot establish meaningful labels, comprehension or successful operation. | Use it to find a hypothesis, then inspect actual content and task behavior. |

These comparisons are interpretations of the source material in the [register](design-guideline-sources-2026-11-14.md), not claims that an entire system endorses one simplified rule.

## Complete local reference disposition

All paths below are relative to `skills/master-design/references/`. “Retain” means no new substantive gap was found within the reference's stated role; cross-links and removal of duplication may still change.

| Reference | Disposition |
| --- | --- |
| `overview.md` | Retain positioning; route new conditional topics (R04). |
| `principles.md` | Retain; make recognition and neutral consequential choices easier to find (A06, P04). |
| `accessibility.md` | Extend coverage and applicability routes (A01–A06). |
| `foundations/color.md` | Retain roles/contrast; link image-background and chart-encoding decisions (V07–V08). |
| `foundations/typography.md` | Extend reading measure/rhythm; retain role hierarchy and exact-content handling (V05). |
| `foundations/spacing.md` | Clarify nested relationship checks (V02). |
| `foundations/sizing.md` | Correct density restriction (R01). |
| `foundations/shape.md` | Retain circular constraints; link embedded-control case (V01). |
| `foundations/elevation.md` | Retain separation of grouping, paint and input layering. |
| `foundations/icons.md` | Extend viewport/ink inspection and image-role selection (V03, V07). |
| `foundations/motion.md` | Add ongoing-content, timing and flashing distinctions (A04). |
| `foundations/layout.md` | Retain task compositions; link measure, disclosure and hierarchy checks (V05–V06, C03). |
| `foundations/content.md` | Extend cognitive load and predictable outcomes (A06). |
| `foundations/localization.md` | Retain strong direction/IME/format coverage; link date-only/instant decisions (C01). |
| `foundations/data-visualization.md` | Extend semantic palette/series stability (V08). |
| `components/actions.md` | Extend grouped/split actions and unavailable states (C04, C07). |
| `components/forms.md` | Extend date/value choice and formatted-value behavior (C01–C02, C07). |
| `components/selection.md` | Extend exact/approximate, searchable/multiple/hierarchical choices and predictable updates (A06, C02, C05–C06). |
| `components/navigation.md` | Extend disclosure/tab choice and page-discovery routing (A01, C03). |
| `components/overlays.md` | Extend hover lifecycle and composite command routing (A02, C04). |
| `components/feedback.md` | Retain channel/state foundations; extend regional waiting/failure (P06). |
| `components/data-display.md` | Extend card semantics and large-collection routing (C06, P01). |
| `patterns/forms.md` | Extend branching and review correction (A06, P03). |
| `patterns/search.md` | Retain stale response, input and history coverage; link large collections (P01). |
| `patterns/navigation.md` | Retain deep-link/history model; add bypass/multiple-way applicability (A01). |
| `patterns/async.md` | Retain identity/unknown-outcome model; add regional degradation (P06). |
| `patterns/recovery.md` | Retain; link privacy/AI-specific consequences (P04–P05). |
| `patterns/responsive.md` | Correct visible-geometry restriction (R01). |
| `patterns/onboarding.md` | Retain optional entry/progress; route disclosure choice (C03). |
| `patterns/access.md` | Retain identity/permission distinction; add timed-session applicability and privacy cross-link (A04, P04). |
| `patterns/editing.md` | Retain draft/version/conflict model; cross-link suggestion acceptance (P05). |
| `patterns/files.md` | Retain chooser, transfer/processing and partial retry. |
| `patterns/collections.md` | Extend ordering and page/selection interaction (P01–P02). |
| `patterns/empty.md` | Retain absence taxonomy; add regional unavailable content (P06). |
| `patterns/notifications.md` | Retain attention/durable recovery; link timing requirements (A04). |
| `patterns/help.md` | Retain contextual help, consistent placement and noncircular support. |
| `surfaces.md` | Retain contour/depth craft; scope texture recipe (R02). |
| `geometry.md` | Extend embedded-control measurement (V01). |
| `images.md` | Retain edge/crop evidence; extend image roles and overlaid text checks (V07). |
| `typography.md` | Extend icon compensation and optical method (V03–V04). |
| `layout.md` | Retain mixed-row mechanics; clarify nested grouping and hierarchy tests (V02, V06). |
| `states.md` | Correct target-growth wording; extend unavailable-state distinction (R01, C07). |
| `motion.md` | Retain reversal and completion independence; cross-link A04. |
| `materials.md` | Remove article-scope dependency; retain optional effects/fallback (R03). |
| `avatar-stacks.md` | Retain geometry, identity and interaction; relocate repo-specific preservation obligations (R03). |
| `evidence.md` | Add hierarchy diagnostic, counterexamples and current task evaluation (V06, R05). |
| `focus.md` | Extend shortcuts, pointer alternatives and composite routing (A03, C04, P02). |
| `scrolling.md` | Retain scroll ownership/context; link long-collection limitations (P01). |
| `studies/reading.md` | Retain journey; add relevant long-collection/disclosure checks (C03, P01). |
| `studies/service.md` | Extend with conditional branch and date/value decision coverage (C01–C02, P03). |
| `studies/workspace.md` | Extend collection ordering/degradation coverage (P01–P02, P06). |

## WCAG 2.2 A/AA content crosswalk

The normative document contains **55 A/AA success criteria**, excluding the obsolete 4.1.1 and all AAA criteria. IDs below were checked against the [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/). This is a **documentation coverage map**, not the result of testing the Master Design website or a consumer product.

- **C:** a useful explicit instruction exists for the principal behavior; retain and link to exact applicability.
- **P:** the theme is mentioned but an actionable condition, exception or check is incomplete.
- **N:** no meaningful instruction was found. Add only when the criterion's trigger applies; do not add unused functionality to satisfy a checklist.

| Criterion | Coverage | Current home or planned action |
| --- | --- | --- |
| 1.1.1 | P | Image alternatives exist; complete functional/complex image decisions (V07). |
| 1.2.1 | N | Media alternatives (A05). |
| 1.2.2 | N | Prerecorded captions (A05). |
| 1.2.3 | N | Appropriate description/media alternative (A05). |
| 1.2.4 | N | Live captions when applicable (A05). |
| 1.2.5 | N | Prerecorded audio description when applicable (A05). |
| 1.3.1 | C | Accessibility, fields, headings and tabular relationships. |
| 1.3.2 | C | Layout/responsive source order. |
| 1.3.3 | P | Color redundancy exists; sensory-only instructions need explicit handling (A01). |
| 1.3.4 | P | Landscape testing exists; orientation restriction/exception needs routing (A01). |
| 1.3.5 | P | Autocomplete exists; identify applicable personal-input purposes (A01/C02). |
| 1.4.1 | C | Color, accessibility and concurrent state cues. |
| 1.4.2 | N | Automatic audio controls (A04/A05). |
| 1.4.3 | C | Text contrast and actual composited pairs. |
| 1.4.4 | C | Text resizing and content growth. |
| 1.4.5 | N | Real text versus images of text and exceptions (V07/A01). |
| 1.4.10 | C | Reflow with two-dimensional-content exceptions. |
| 1.4.11 | C | Necessary non-text cues and functional boundaries. |
| 1.4.12 | P | Overrides are named; specify applicable override values and inspection (A01/V05). |
| 1.4.13 | P | Hover and keyboard triggering exist; lifecycle incomplete (A02). |
| 2.1.1 | C | Keyboard task completion and native/composite semantics. |
| 2.1.2 | C | Modal exit and no nonmodal trapping; verify all custom widgets. |
| 2.1.4 | N | Character-only shortcut control (A03). |
| 2.2.1 | P | Time loss is discussed; adjustment/extension exceptions missing (A04). |
| 2.2.2 | P | Ongoing-motion control is named; auto-updates and applicability incomplete (A04). |
| 2.3.1 | N | Flash safety criterion (A04). |
| 2.4.1 | P | Landmarks exist; practical repeated-block bypass incomplete (A01). |
| 2.4.2 | C | Document titles and route transitions. |
| 2.4.3 | C | Source order and focus recovery. |
| 2.4.4 | C | Meaningful destinations and repeated-action context. |
| 2.4.5 | P | Navigation/search exist; multiple-way applicability incomplete (A01). |
| 2.4.6 | C | Descriptive headings and visible labels. |
| 2.4.7 | C | Independent visible focus. |
| 2.4.11 | C | Sticky regions and focus not entirely hidden. |
| 2.5.1 | N | Multipoint/path-based gesture alternatives (A03). |
| 2.5.2 | C | Completed activation, cancellation and touch scrolling. |
| 2.5.3 | C | Visible wording in accessible names. |
| 2.5.4 | N | Motion actuation alternatives and disabling (A03). |
| 2.5.7 | P | Non-drag alternative named; distinguish single-pointer from keyboard (A03/P02). |
| 2.5.8 | C | Minimum target and exceptions; keep comfort separate. |
| 3.1.1 | C | Document language in localization/type. |
| 3.1.2 | C | Language/region changes inside passages. |
| 3.2.1 | P | Stable focus is covered; unexpected context change on focus needs explicit instruction (A06). |
| 3.2.2 | P | Commitment is distinguished; navigation on input needs explicit instruction (A06). |
| 3.2.3 | C | Stable navigation labeling/ordering. |
| 3.2.4 | C | Consistent names and meanings. |
| 3.2.6 | C | Help's consistent relative order and applicability. |
| 3.3.1 | C | Field errors, associations and summaries. |
| 3.3.2 | C | Visible labels and persistent constraints. |
| 3.3.3 | C | Actionable corrections and distinction from service errors. |
| 3.3.4 | P | Review/undo/confirmation exist; map to exact consequence categories and alternatives (A01/P03). |
| 3.3.7 | P | Prior information preservation is named; autofill/reselection and exceptions need detail (P03). |
| 3.3.8 | P | Password managers/paste and alternatives exist; clarify cognitive-test applicability and exceptions (A01). |
| 4.1.2 | C | Native semantics and accessible control states. |
| 4.1.3 | C | Meaningful status announcements without unnecessary focus movement. |

Do not interpret C as a full restatement of the criterion. Standards links remain necessary for precise conformance decisions. No new AAA target, focus-appearance or line-measure condition should be silently promoted into AA. Browser-emulated zoom, synthetic IME and accessibility snapshots do not establish real AT or hardware results.

## Boundaries and completion conditions

The expansion should complete all 32 admitted work items, including conditional topics; sequencing is not a license to silently defer them. Completion means an implemented rule or decision aid, a counterexample where it could be misapplied, a canonical home, and evidence appropriate to its claim. The [plan](../design-guide-expansion-plan.md) defines those artifacts and checks.

Do not add platform-specific navigation bars, spatial computing, gaming input, native haptics, payment protocols, identity/security architecture, legal compliance recipes, analytics instrumentation, research recruitment or design-system governance. Maps, rich editors, diagrams and specialist tools receive relevant input/contrast/focus guidance and pointers to established patterns; this project need not build a new map engine, editor or exhaustive widget catalog. Privacy and AI enter only as interface decisions in tasks that contain them.

No claim of timeless completeness is made. This review closes a defined corpus and decision inventory as of 2026-11-14. Future topics require a concrete interface failure or materially different decision, rather than a larger list of design terminology.

## Verification record for this audit

This change adds review and planning documentation only. It does not change canonical guidance, site presentation, public skill version, dependencies, release metadata, global installations or deployment state.

- `bun run check` passed with Bun 1.4.4 and Node 24.20.0: preparation of 51 canonical pages, skill/package and local-link checks, release metadata at 0.3.4, delivery configuration validation, TypeScript and all 66 tests. The current-run log is in ignored `artifacts/design-guideline-audit-check.log`.
- A separate structural check matched the disposition table against all 51 actual reference paths, verified 32 unique finding IDs and 55 unique criterion IDs, confirmed the existing figure/lab/study inventory, and checked six nonconflicting proposed reference routes and 12 evidence specifications.
- The content map contains 28 C, 16 P and 11 N entries under the definitions above. These are documentation classifications, not percentages of accessibility compliance.
- The changed-file review is limited to the audit, source register, implementation plan and verification index; whitespace validation passed. No fresh forward-agent run, screen-reader session, physical-device test or new figure validation is claimed. Site build/browser recapture was unnecessary because canonical text and presentation did not change.
