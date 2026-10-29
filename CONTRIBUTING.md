# Contributing to Master Design

Improve a specific interface relationship and leave enough evidence for someone else to judge it. A useful contribution may be a clearer instruction, a missing constraint, a reproducible failure, an original comparison or a focused example fix.

[Report a problem](https://github.com/master-co/design/issues/new?template=bug-report.yml), [propose a craft reference](https://github.com/master-co/design/issues/new?template=craft-proposal.yml), or [suggest a documentation correction](https://github.com/master-co/design/issues/new?template=documentation.yml). Small fixes can go straight to a pull request. Open an issue before adding a new topic or substantially changing the skill's direction.

## What belongs here

The skill helps an agent build and refine interfaces in the consumer project's own framework, brand, fonts and density. Keep general guidance separate from the optional Aron preferences profile. A compelling specimen value is not a universal rule.

| Change | Start here |
| --- | --- |
| Task selection or workflow | `skills/master-design/SKILL.md` |
| Craft mechanisms, constraints and verification | `skills/master-design/references/` |
| Article-to-reference coverage | `examples/interface-craft/cases.json`, `docs/article-map.md` |
| Working examples and original studies | `examples/interface-craft/` |
| Reproduction and verification helpers | `scripts/`, `tests/` |
| Source attribution and evidence limits | `docs/sources.md`, `docs/verification.md` |

Keep the entry concise and load detailed references on demand. Everything required after installation must stay inside `skills/master-design/`; an installed skill must not require this repository, the example app, the companion article or an absolute local path.

## Develop locally

Use Node 24.20.0 and Bun 1.4.4 for repository development. This tooling is not a requirement for people using the installed skill.

```sh
bun install --frozen-lockfile
bun run build
bun run demo
```

The server prints the example URL. Generated HTML, bundles, exports and temporary installs stay ignored. Edit the source modules, not the generated pages.

## Make the change reviewable

1. Describe the visible or functional problem and the conditions that reveal it.
2. Explain which relationship changes and what should stay fixed. In comparison studies, vary one factor at a time; record combined adjustments for a complete interface.
3. Separate source facts, measurements, deductions and visual judgment. Label enlargement and pixel density. Keep a matched baseline when turning an approved static design into controls.
4. Check neighboring components and affected states, not just the central example. Preserve selection, focus, disabled behavior, keyboard operation, reduced motion and a readable fallback.
5. Report what you actually ran and what remains unverified. Browser emulation is not a physical device or screen-reader session.

Use original or appropriately licensed material. Record source, version and attribution. Do not copy another author's skill text or assume that an externally hosted image may be redistributed. Screenshots and public reports must not expose private project data. Contributions use this repository's MIT license; bundled fonts and the companion article archive retain their own notices.

## Choose checks by impact

Always run `bun run check`. It validates the single skill, references, contribution forms, example mappings, TypeScript and data logic.

| Affected area | Additional checks |
| --- | --- |
| Installed instructions or resources | `bun run test:install` |
| Example source | `bun run build` and the relevant checks below |
| Search, filters, selection or responsive navigation | `bun run test:browser` |
| Dashboard geometry, native controls or surface states | `bun run test:dashboard` |
| Fractional edges, image insets, text or numeric alignment | `bun run test:native` |
| Avatar layout, photo edges, fallback or participant interaction | `bun run test:avatars` |
| General instruction changes that affect the retained scenarios | `bun run test:forward` and a fresh isolated task when the old scenarios cannot exercise the change |
| Exported study changes | `bun run capture` or `bun run capture:avatars`, then inspect the affected exports |

Install browser binaries with `bunx playwright install chromium webkit` before browser checks. Pixel-sensitive changes need both engines and relevant native densities and fractional scales. Keep a concise result in the pull request; large routine exports belong in ignored `artifacts/`. Reviewed, durable evidence summaries may live in `docs/verification/`.

Documentation-only changes do not require recapturing every image. CI runs the repository's broader checks; a passing workflow supports the tested conditions, not a claim that every interface is correct.

## Submit a pull request

Use a focused branch and a title describing the resulting behavior. Explain the problem, mechanism, scope, evidence and relevant limits. Include matched screenshots for visible changes; keep the same content, viewport, font state and theme. Note changes to skill coverage or provenance.

Maintainers may ask for a smaller case, narrower guidance or a clearer distinction between a personal preference and a functional requirement. Discuss the implementation respectfully, and avoid attaching personal judgments to an author or contributor.
