# Interface craft workspace

A self-contained HTML/CSS/TypeScript study. Run `bun run build` and `bun run demo` at the repository root. No Astro installation or article checkout is needed.

## Behavior

- Search project names and descriptions. The keyboard shortcut is Command/Ctrl+K.
- Filter all projects, in-progress projects, or the empty archived state.
- Select visible rows and clear the selection. Search/filter changes clear selection.
- Workspace summaries retain global totals; the table reports visible versus total records.
- Navigation links target real sections. Narrow layouts offer a disclosure menu; Escape closes it.
- Theme/reset controls belong to the study toolbar. State is local and resets on reload.
- Without JavaScript, all records and meaningful static content remain readable; enhancement controls are unavailable.

The snapshot contains four projects, 18 open tasks, three review items across two projects, and 84 completed tasks compared with 70 in the previous 14 days. Totals and the chart use the same data module.

## Provenance

The files under `original/` are first-party source copied from the approved article revision at commit `4733743`, including its original chart geometry and drawing vocabulary. They preserve desktop radii, navigation pitch, section rhythm and illustrative data. `render.mjs`, `prototype.css` and `app.ts` add semantic controls, local behavior and responsive treatment. `tokens.css` contains the selected specimen's shared surface parameters.

The build includes only locally bundled fonts and files. Do not treat this study as a production workspace or a new visual-design movement.


## Preserving the approved details

The reporting period keeps its 212×34 surface and ten-pixel corners; a small static day-count replaces an unavailable dropdown. Native checkbox inputs use scoped paint, with an eleven-pixel mark centered at the approved position and independent 32px desktop / 44px mobile targets. Navigation links keep their original current/resting colors, icon sizes and pitch. The first seven table column starts stay fixed; spare trailing space belongs to the due column.

Run `bun run test:dashboard` for the matched source comparison and affected state/raster checks. Native semantics, local behavior and screenshot export share the same rendered controls.
