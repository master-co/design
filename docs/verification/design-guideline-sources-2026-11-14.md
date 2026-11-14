# Design guideline comparison sources — 2026-11-14

Source register for the [audit](design-guideline-audit-2026-11-14.md) and [implementation plan](../design-guide-expansion-plan.md). Findings are Master Design's synthesis, not an endorsement by the cited organizations. Access date: **2026-11-14**. This register records the representative comparison corpus; it does not claim an exhaustive reading of every external design system.

## Evidence and interpretation

Read the local entry and all 51 canonical references at commit `efa335e5e6678993fc40614e9451a105920b4106`. Compare the actual instructions with first-party guidance, not just matching chapter titles. Use the source's own scope and conformance level. A platform convention, component specimen, research heuristic and normative Web requirement carry different weight.

Public pages were inspected through web extraction or direct first-party content. Apple documentation's first-party Markdown representation supplied otherwise script-dependent text. Material 3's relevant pages were also rendered with local Playwright Chromium because ordinary extraction returned an application shell. Numeric dimensions embedded only in unread diagrams were not treated as verified measurements. Browser rendering was source inspection, not a new Master Design interaction test.

No third-party diagrams or instruction sets were copied. URLs below support the stated decision area; the exact acceptance scenarios and proposed chapter structure are original recommendations. Where a source is incomplete, redirected or ambiguous, record the limitation instead of filling it from memory.

## Design systems and platform guidance

### Apple Human Interface Guidelines

- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) and [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): contextual grouping, alignment, adaptation and operable controls. Used for V01–V02 and R01. Native point sizes, platform chrome and Liquid Glass are not universal Web defaults. Neither examined page establishes the reported universal 4px field-action rule.
- [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy): purpose, necessary data and contextual permission decisions; informs P04 without importing native permission APIs or legal compliance claims.
- [Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai): capability communication, control, refinement and privacy; informs P05. The page's dated update was June 8, 2026. Proposed local simulations do not reproduce an Apple product or require a model service.

### Material Design 3

- [Spacing](https://m3.material.io/foundations/layout/grids-spacing/spacing) and [density](https://m3.material.io/foundations/layout/grids-spacing/density): spatial relationships and context-dependent density. Used for V01–V02 and R01; do not import a token scale as a prerequisite.
- [Button guidelines](https://m3.material.io/components/buttons/guidelines) and [specifications](https://m3.material.io/components/buttons/specs): adaptive component dimensions and component-specific label conventions. Guidelines support reconsidering the existing prohibition on visible control growth. Image-only specification numbers are not evidence for a universal offset or Web target minimum.
- [Text-field guidelines](https://m3.material.io/components/text-fields/guidelines): field anatomy and optional trailing actions. Inspected to test the original attribution; no universal equal-three-edge or 4px rule was established.

### Fluent 2

- [Layout](https://fluent2.microsoft.design/layout): grouping, grids and a spacing scale with explicit optical exceptions. Informs V02–V03 and the distinction between a system's tokens and transferable relationships.
- [Iconography](https://fluent2.microsoft.design/iconography): coherent assets and recognizable, consistent icon use. The proposed ink/viewport inspection is a local method, not a mandate to replace a consumer's icon set.

### Adobe Spectrum

- [Typography](https://spectrum.adobe.com/page/typography/): inspected the current brand/type foundation; its font choices are not missing requirements for Master Design.
- [Rounding](https://spectrum.adobe.com/foundations/styles/object-styles/rounding): useful comparison for scoped nested contours and optical treatment of smaller nested components. Master Design already explains concentric circular geometry; do not duplicate a second radius system.
- [Writing for errors](https://spectrum.adobe.com/page/writing-for-errors/): error prevention, recovery and creative-tool examples. Its disabled-submit and bounded-value normalization examples are not universal instructions for consequential quantities. Informs C02/C07 and the conflict analysis.
- Access limitation: the older `using-color` URL redirected to the current color overview, and `in-product-messaging` did not yield usable content. Neither was used as evidence for historical detailed rules or missing current chapters.

### IBM Carbon

- [Typography](https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview) and [pattern overview](https://www.carbondesignsystem.com/building-blocks/core/patterns/overview): compare foundational roles and pattern breadth; do not import IBM fonts or enterprise-specific component inventory.
- [Data visualization color palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes): categorical and sequential encoding informs V08; project colors remain under project control.
- [Disabled states](https://www.carbondesignsystem.com/building-blocks/core/patterns/disabled-states): compare discoverability and explanation decisions for C07. Imprecise descriptions of screen-reader behavior are not treated as a normative HTML rule; focusability and reading exposure must be distinguished.

### Atlassian Design System

- [Spacing](https://atlassian.design/foundations/spacing/) and [iconography](https://atlassian.design/foundations/iconography/): compare grouping and asset consistency for V02–V03. Token values remain scoped to the system.
- [Drag-and-drop accessibility guidelines](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/): alternative operations, understandable outcomes and feedback inform P02. No dependency on Pragmatic drag and drop is proposed.

### Ant Design

- [Proximity](https://ant.design/docs/spec/proximity/) and [alignment](https://ant.design/docs/spec/alignment/): compare grouping and scanning. Master Design already covers shared edges and number alignment; new work concerns explicit nested-spacing decisions.
- [Contrast](https://ant.design/docs/spec/contrast/): includes restraint for consequential decisions, informing P04's neutral choices. It is not evidence for a jurisdiction-specific consent rule.
- [Data entry](https://ant.design/docs/spec/data-entry/) and [data display](https://ant.design/docs/spec/data-display/): compare control selection and information organization. Single-line status/action prescriptions and missing-value glyph conventions are product choices; do not override localization, content growth or meaningful missing-data explanations.

### GOV.UK Design System

- [Pattern index](https://design-system.service.gov.uk/patterns/), [dates](https://design-system.service.gov.uk/patterns/dates/), [accordion](https://design-system.service.gov.uk/components/accordion/) and [text input](https://design-system.service.gov.uk/components/text-input/): task-led input selection, remembered dates, persistent instructions and costs of hiding content. Informs C01–C03, A06 and P03.
- [Date-input history](https://design-system.service.gov.uk/components/date-input/history/) and the [2020 number-input article](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/): historical evidence explaining why numbers and identifiers need different contracts. Old browser defects and removed attributes are not asserted to be current universal behavior.

### U.S. Web Design System

- [Typography](https://designsystem.digital.gov/components/typography/) and [measure tokens](https://designsystem.digital.gov/design-tokens/typesetting/measure/): contextual reading measures, including the 45–90 range and approximate 66-character target. Informs V05; preserve the distinction between actual text, unit choice and a heuristic.
- [Date picker](https://designsystem.digital.gov/components/date-picker/): choosing from dates versus supplying remembered dates; informs C01. Do not import its component API or every changelog statement as a general semantics rule.
- [Cards](https://designsystem.digital.gov/components/card/): grouping, content hierarchy and project-level accessibility checks; informs C06. Its actionable-summary card model is a scoped component. It does not prove that every visually enclosed group must be interactive.
- [Data visualizations](https://designsystem.digital.gov/components/data-visualizations/): stable, understandable color roles and textual access to the intended message and data; informs V08. A table alone may not convey a chart's narrative. Do not copy a specimen's hiding strategy or axis convention without considering the actual chart.

### GitHub Primer

- [Navigation](https://primer.style/product/ui-patterns/navigation/), [progressive disclosure](https://primer.style/product/ui-patterns/progressive-disclosure/) and [pagination](https://primer.style/product/components/pagination/): task context, hidden content and bounded collections; informs C03 and P01.
- [Loading](https://primer.style/product/ui-patterns/loading/) and [degraded experiences](https://primer.style/product/ui-patterns/degraded-experiences/): region-level waiting and useful partial functionality; informs P06. Time elapsed does not establish a determinate progress denominator, and ordinary completion must not automatically steal focus.

### Shopify / Polaris

- [Current form UX guidance](https://shopify.dev/docs/apps/design/user-experience/forms) and [app design best practices](https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices): compare host-product forms and task continuity with Master Design's existing editing patterns. Explicit save-bar behavior belongs to the Shopify context, not a universal Web workflow.
- The old Polaris pattern entry redirected to the [current Polaris API documentation](https://shopify.dev/docs/api/polaris). This review does not claim to have audited an unavailable historical Polaris pattern library. No additional chapter is justified solely by an old table of contents.

## Web requirements and implementation contracts

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/): normative criteria and levels, used to enumerate the audit's 55 A/AA rows. Coverage labels describe text in Master Design, not a conformance result. The obsolete 4.1.1 and AAA criteria are excluded from that count.
- Understanding explanations inspected for [hover/focus content](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), [character shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [pointer gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html), [motion actuation](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html), [dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [timing](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), [pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) and [flashing](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html): inform A02–A04 and P02. Informative explanations clarify the normative text; exceptions remain relevant.
- Additional explanations for [bypass blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), [multiple ways](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html), [on input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) and [redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html): inform A01/A06/P03. [Visual presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html) is AAA, including its adjustable line-measure condition; it is not the basis for declaring a default 45–75-character AA requirement.
- [ARIA Authoring Practices patterns](https://www.w3.org/WAI/ARIA/apg/patterns/), with [slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), [accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [tree view](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) and [feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): compare appropriate interaction contracts for C02–C05/P01. APG is guidance; roles are not chosen by visual appearance alone. Automatic tab activation depends on panel latency.
- [HTML disabled controls](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute) and [ARIA disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled): semantic references for C07. Neither a visual treatment nor an ARIA attribute implements all native event/submission behavior.
- [CSS font-relative lengths](https://www.w3.org/TR/css-values-4/#font-relative-lengths): technical definition supporting V05's `ch` caveat. The inspected Level 4 publication is a Working Draft, not a WCAG requirement; `ch` is based on the zero glyph's advance, not an arbitrary text's literal character count.

## Supplemental inclusive-design and judgment sources

- WAI [media accessibility](https://www.w3.org/WAI/media/av/), [carousel tutorial](https://www.w3.org/WAI/tutorials/carousels/), [image decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/) and [multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/): task-triggered decisions for V07/A05/P03. A transcript is not universally interchangeable with captions or audio description.
- W3C [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/): supplemental Group Note, used for A06's recognition and clear instructions. It does not create extra WCAG AA success criteria.
- W3C Internationalization [inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/): compare against existing localization safeguards; no wholesale RTL gap was found.
- NN/g [squint test](https://www.nngroup.com/videos/squint-test/), [visual design cheat sheet](https://www.nngroup.com/articles/visual-design-cheat-sheet/) and [usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): optional diagnostic and judgment vocabulary for V06/A06. The audit claims no new empirical validation from applying these heuristics.
- Microsoft HAX [AI guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/), [explanations](https://www.microsoft.com/en-us/haxtoolkit/guideline/make-clear-why-the-system-did-what-it-did/) and [granular feedback](https://www.microsoft.com/en-us/haxtoolkit/guideline/encourage-granular-feedback/): interaction-level input to P05. Do not require an entire AI development process, fabricate explanations, or equate a feedback control with correction of a model.

## Limits and later maintenance

This corpus samples eleven established systems/platform guides plus standards and specialist sources. It is deliberately broad across consumer, enterprise, government, publishing and authoring interfaces. Coverage is not a popularity ranking, a quantitative quality score or proof that no other useful guidance exists.

The local date-picker defect was reported, not reproduced. No exact 4px platform requirement, universal spacing inequality, mandatory icon-side offset or universal upward text shift was established. These proposals need conditional reasoning and local visual evidence.

When implementing, recheck sources for any changed normative claim, route or relevant contract. Preserve dated evidence and provenance; add new evidence when a decision changes. Do not turn maintenance into an obligation to browse every external system for each ordinary interface task.
