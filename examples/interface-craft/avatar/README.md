# Avatar stacking study

Private example source, not a Master UI public API. The shared renderer and CSS supply the interactive example, four diagrams and the existing workspace's compact owner groups.

Build from the repository root, then open `avatars.html` on the demo server. `avatar-studies.html` is the fixed-canvas source for A1/A2/B1/B2. The live example supports surface and selection changes, light/dark appearance, LTR/RTL, zero/one/three/four/seven people, mixed initials/photos and a deliberately failed photo. One group button opens a native participant dialog. Individual list rows use native details for actual role disclosure; no overlapping per-person targets are hidden in the stack. Without JavaScript, the initial participant list remains readable.

Three original generated fictional portraits are bundled locally. The first is the user-requested revised female portrait; names and roles are illustrative. Source PNGs, exact prompts, conversion details and hashes are in [the portrait archive](../../../assets/avatars/prompts.md). No third-party photos, brand screenshots or remote runtime assets are used.

The drawing source starts at D32/O8/G2: layout 80px for three, derived outside paint 84px. Both groups in a comparison use identical sources and crop. A1/A2 change only spacing: gap6 versus overlap8, at matching inline-start and vertical center. Both retain the same G2 and inward stroke; spaced layout/paint are 108/112px, stacked 80/84px. A2 holds its white inner stroke at 10% on both sides. The live separator toggle isolates ring presence separately; B1/B2 change only inner-stroke presence. The visible diagram is a ×4 geometry enlargement, exported at 2×; native raster evidence is captured separately.

The full workspace retains D22/O5, first-circle coordinates and column starts. Its outside separator is 1.5px and follows the actual selected/hover/dark row surface. It retains initials; the separate photo study proves image-edge behavior.

```sh
bun run capture:avatars
bun run test:avatars
```

The test records actual renderer versions, native pixels and unverified hardware/assistive-technology conditions. The installed skill reference carries the mechanisms without depending on these files.
