# Master UI foundations

Master UI applies this guide through reusable HTML and CSS components, semantic theme values and interaction behaviors. The general guidance remains useful in other brands and frameworks; this page describes the choices specific to Master UI.

## Ownership

| Project | Owns | Does not own |
| --- | --- | --- |
| Master Design | Design principles, usage guidance, foundations, patterns and verification methods | A second runtime stylesheet or component API |
| Master UI | Component contracts, themes, reusable styles, behaviors and implementation examples | Product-specific content, routing or application data |
| Master CSS | Styling syntax, compilation, runtime delivery and general preset primitives | A product's interaction decisions |
| Master | Brand and ecosystem website, shared first-party site shell and publishing infrastructure | A parallel reusable component library |

A consumer uses Master UI for reusable presentation and Master CSS for local composition. The site shell assembles navigation, documentation and site-specific presentation. Design informs these implementations through documentation, not a runtime dependency.

## Native behavior and explicit contracts

Start with native elements and their actual state attributes. Master UI classes describe supported markup; its contracts document the public parts and states. A visual class does not supply missing keyboard behavior. Use the shipped behavior or a complete framework integration when the pattern requires one.

Do not invent modifiers from a similar library. Read the current component contract before writing markup, then run the UI checker and test the rendered interaction. Static checks cannot prove focus, announcements or visual contrast.

## A restrained material language

Master UI's default light and dark appearances use coherent surface roles, soft contours and controlled depth. Keep functional boundaries and focus independently legible. State may change material, but selection and error still need semantic and non-color cues.

Use the package's theme and public custom properties as the executable source of values. This guide does not maintain a second numeric token table. Theme overrides should change roles consistently; a local visual exception should remain local.

## Components, layouts and blocks

A component earns its shared contract through material, state, platform behavior or geometry its parts must coordinate. A layout arranges regions and scrolling. A block composes components and layout for a concrete stretch of a page.

Do not promote site copy or a one-off hero arrangement into a universal component. Conversely, a reusable dialog, button or field should not acquire a second implementation in the site shell. Keep adapters limited to actual site composition and compatibility needs.

## Guideline to implementation

| Design concern | Master UI reference | Verify in the consumer |
| --- | --- | --- |
| Semantic colors, surfaces and depth | [Default theme](https://ui.master.co/guide/theme) and [theming](https://ui.master.co/guide/theming) | Contrast on actual adjacent surfaces in both themes |
| Type, spacing, dimensions and overrides | [Customization](https://ui.master.co/guide/customization) | Long content, density, text resizing and target bounds |
| Markup, parts and states | [Contracts](https://ui.master.co/guide/contracts) | Native semantics and concurrent states |
| Keyboard, value and focus behavior | [Behaviors](https://ui.master.co/guide/behaviors) | Complete input sequence, teardown and focus return |
| Runtime and fallback requirements | [Browser support](https://ui.master.co/guide/browser-support) | Supported browsers, optional enhancements and usable fallback |
| Framework integration | [Frameworks](https://ui.master.co/guide/frameworks) | Value ownership, lifecycle and duplicate initialization |

These links identify the implementation owner; they are not a claim that every possible composition has been verified. For the current available components and their examples, use the [Master UI catalog](https://ui.master.co/components). Proposed patterns must not appear as supported controls before their contract, behavior and evidence exist.

## Review a change together

Start with the relevant foundation and usage guidance. Change the implementation in Master UI, then verify a representative consumer page. Update documentation when the intended behavior changes. Keep source, examples, contract and tests aligned; record browser and assistive-technology limits rather than turning a screenshot into a blanket accessibility claim.
