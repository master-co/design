# Master Design

Maintain one portable Agent Skill at `skills/master-design`. Keep the entry concise and load topic references on demand. Installed guidance must not depend on files outside that skill folder, this checkout, a particular agent, or the companion article.

Preserve each consumer project's framework, brand, fonts, density and styling conventions. Aron preferences are explicitly selected, never a universal default. Recipes are scoped specimens; distinguish functional boundaries from decorative contours.

Write the skill, references, docs, code labels and reports in English. Changes should improve observable behavior or judgment. Avoid growing blanket rules from one example, copying third-party instruction sets, or treating visual preference as a historical movement.

Use Bun 1.4.4 for development dependencies and Node 24 for scripts; commit `bun.lock` when dependencies change. `bun run build` creates the standalone example. `bun run check` checks packaging, types and data logic. Browser/native checks are needed for affected geometry or interaction; documentation-only changes do not require recapturing every image.

Generated builds, screenshots and temporary installs belong in ignored `artifacts/` or example `dist/`. Keep reviewed evidence summaries in `docs/verification/`. The article source and original illustrations keep their own provenance and licensing; do not copy the full article asset history here.

Commit, push, release, deployment and global skill installation require task authorization. Preserve unrelated work. The repo's example is a local study, with no backend or external data writes.
