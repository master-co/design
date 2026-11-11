# Master Design

Maintain the public design guide and one portable Agent Skill at `skills/master-design`. Keep the entry concise and load topic references on demand. Installed guidance must not depend on files outside that skill folder, this checkout, a particular agent, or the companion article.

Preserve each consumer project's framework, brand, fonts, density and styling conventions. General guidance ships no personal style profile. Master UI-specific foundations are explicitly scoped to that library and do not override unrelated consumer brands. Recipes are scoped specimens, never universal defaults; distinguish functional boundaries from decorative contours.

Write the skill, references, docs, code labels and reports in English. Changes should improve observable behavior or judgment. Avoid growing blanket rules from one example, copying third-party instruction sets, or treating visual preference as a historical movement.

Use Bun 1.4.4 for development dependencies and Node 24 for scripts; commit `bun.lock` when dependencies change. `bun run build` creates the standalone example. `bun run check` checks packaging, types and data logic. Browser/native checks are needed for affected geometry or interaction; documentation-only changes do not require recapturing every image.

Generated builds, screenshots and temporary installs belong in ignored `artifacts/` or example `dist/`. Keep reviewed evidence summaries in `docs/verification/`. The article source and original illustrations keep their own provenance and licensing; do not copy the full article asset history here.

A release is a `SKILL.md` `metadata.version` with a matching dated `CHANGELOG.md` section and no `v` tag yet; pushing it to `main` tags and publishes it (see CONTRIBUTING.md). Do not change the version unless asked to release. Commit, push, release, deployment and global skill installation require task authorization. Preserve unrelated work. The repo's example is a local study, with no backend or external data writes.

The Markdown under `skills/master-design/references/` is the single content source for the guide and installed skill. The English-first site generates ignored MDX adapters, navigation and search from `site/catalog.mjs`; never edit generated `site/content`. Use the shared `@master/internal-site` shell and `@master/ui` presentation rather than maintaining a parallel component or token library. Keep executable tokens and component APIs in Master UI, styling-engine behavior in Master CSS, and site infrastructure in Master.

For site changes run `bun run check:site`, `bun run build:site` and the affected browser checks. Preserve existing craft examples and their evidence. Site publishing is separate from the existing skill tag/release workflow.
