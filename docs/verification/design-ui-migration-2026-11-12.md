# Design guide ownership and horizontal identity

Status: locally verified with official packages; not pushed, tagged or deployed. The UI destination must be verified before the Design redirects are published.

## Content ownership

Master UI-specific rationale moves to `https://ui.master.co/guide/design`; the real portable export is `/guide/design.md`. Design retains its general principles, foundations, usage, patterns and craft as one self-contained skill. Version 0.3.1 removes the library-specific reference and keeps 37 installed files. Library integration reads the consumer's installed contracts and theme; using this skill does not require browsing the UI website.

The Design navbar links directly to `https://ui.master.co`. The old HTML routes `/master-ui`, `/master-ui/` and `/master-ui.html` permanently redirect to the UI guide. `/guidelines/master-ui.md` and the convenience alias `/master-ui.md` redirect to its real Markdown export. Destinations have no fragment, so the meaningful original fragments can continue to the moved headings. The UI page must retain:

- `ownership`
- `native-behavior-and-explicit-contracts`
- `moonstone-and-obsidian`
- `choose-a-role-on-the-material-ladder`
- `concentric-geometry-and-continuous-corners`
- `state-feedback-on-a-stable-control`
- `paper-demonstrates-a-different-material`
- `customization-boundaries`
- `components-layouts-and-blocks`
- `guideline-to-implementation`
- `review-a-change-together`

The old chapter is removed from Design's generated content, downloads, search, sitemap and LLM index. Existing principles/elevation compatibility aliases stay unchanged. The density comparison moves to `/foundations/sizing`; its local behavior, SSR readiness gate and browser assertions are retained.

## Brand source and scope

The Master Python generator now uses the original design glyphs beside the gold M for every Design horizontal lockup. The light variant uses neutral dark ink; the dark variant uses light ink. Print variants stay entirely black or white. Dimensional variants keep their existing mark treatment. Stacked lockups and standalone wordmarks retain the full family name.

Twelve canonical artwork files change: six horizontal SVGs, two horizontal PNGs, two social SVGs and two social PNGs. Ten existing Design repository copies are synchronized. The Master public logo downloads, kit members and ZIP are regenerated. All other canonical/public artwork bytes match the saved baseline, including other products and the Design stacked/wordmark assets.

The GitHub and Open Graph banners keep the old full-name lockup's glyph scale and are recentered. Their emitted SVG scale values remain 0.62 and 0.59 respectively. The shorter word is not enlarged to fill the former 72 percent width. The header keeps its existing 20px artwork height.

## Verification

- Root check: 14 tests, self-contained references, release metadata and TypeScript passed.
- Site check: Astro and Svelte reported zero errors/warnings; all five site tests passed.
- Static build: 34 guide pages plus the 404 page, with no retired chapter HTML or Markdown left behind.
- Skill creator validator passed in an isolated temporary Python environment; detached skills@1.4.9 installation passed with 37 files. Release plan identifies v0.3.1 after v0.3.0; no tag was created.
- Chromium 153.0.8010.12 and WebKit 26.6 passed held-header and held-density-module readiness, density switching/submission, light/dark canonical search material, narrow navigation/reflow and text resizing. Chromium also passed the empty forced-colors search focus check.
- Actual Wrangler Pages 4.129.0 parsed all five redirect rules. Twenty GET/HEAD requests, including query strings, returned the expected permanent destinations; three retained guide/download routes returned 200. The local bundled workerd supports dates only through 2026-09-10, so the rehearsal used that CLI compatibility override; production configuration was not changed.
- Inspected the before/after horizontal identity contact sheet and rendered sizing page. Detailed baseline hashes, screenshots and browser/redirect reports are in the task workspace under `work/doc-unification/design`.

The candidate-2 shared archive (still labeled 0.2.10 for local integration, not an official release) also passed the complete site build and browser suite after restricting preview-switch CSS to its actual owner. Its archive SHA-256 is `62860f7f79e85bbf0510f9068b52edc917d515d6fe5db70d79326bd0e1042d1b`. The official installed package is backed up separately; production pins remain unchanged.

Candidate 4 also passed Design type checks, build and both browser engines (archive SHA-256 `d91d43796799eeb3db743addccb87cef3beec265ac0ffe8fcccb58ce92aceb3b`). A separate scratch Astro fixture found a shared diagnostic-wrapper slot-forwarding regression: default content was suppressed by phantom named slots, and absent captions produced an empty caption. Design does not consume that wrapper; the issue was reported to the shared owner and is not counted as a passing shared acceptance.

Candidate 5 resolves that forwarding regression. Seven real Astro fixture cases passed, including `resultKind="generated-css"` without output (no empty disclosure), default source, all named slots, prop precedence, diagnostics and titled/untitled captions. Three reusable shared-package tests compile the actual Astro components with the installed Astro compiler and render them through AstroContainer; all pass. Running the same behavioral assertions against the previous wrapper fails on missing default content, demonstrating regression coverage. The final Design candidate-5 build contains only the 34 public guides and 404; the temporary fixture was removed. Archive SHA-256: `3a76ec20934f9273a06ec9e981edd465c2d2be217396f45309879bdf9fa4da59`.

CUA review remains coordinated by the primary agent. This record does not claim new hosted acceptance, physical-device testing or screen-reader testing.

## Design viewport matrix

The existing `bun run test:site` CLI now also captures the overview, its semantic table and the sizing example at 390, 768 and 1280 CSS pixels in both light and dark modes. Chromium and WebKit cover 12 profiles and produce 36 additional screenshots. Assertions cover document overflow, bounded table overflow, canonical table markup, nonoverlapping header parts, a single visible logo, its unchanged 20px height/aspect ratio, and the neutral light/dark wordmark ink. Reduced motion and disabled screenshot animations keep captures stable. These representative-page checks supplement rather than replace the existing 320px/200% text, search, forced-colors, density submission and held-module readiness checks.

Candidate 8 (`@master/internal-site` local archive labeled 0.2.11; SHA-256 `d9c8e738371dd514e8102d0d1f3d9726d1ea232c4e4cbfb4d7ff3d3247931e88`) passed site types, all five site tests, the 35-page build and the expanded browser suite with Chromium 153.0.8010.12 and WebKit 26.6. The official dependency pins and lockfile remain unchanged. Reports and actual captures are preserved under the task workspace's `work/doc-unification/design/candidate-8-browser`; representative home, table and sizing screenshots were visually inspected without additional findings. This is local candidate evidence, not published-package or hosted acceptance. VoiceOver was explicitly waived and was not tested.

## Official package integration

The final site pins `@master/internal-site` 0.2.11 and `@master/ui` 0.0.4, with exact release-age exceptions. The lockfile changes only those two package entries and their workspace pins; the CSS packages remain at 2.1.3. A fresh frozen-lockfile installation replaced the local candidate installation. Every installed regular file matched the corresponding registry tarball: 779 shared-package files and 316 UI files. Archive SHA-256 values are `ce7c93077691d12fa53f33ac503d0afa899191b4aa402e8b76d6cd9edae8341f` and `d4b4f0c79bfdd3a680b4bc4a05ff8b7d795c9b84a1d85b391bc83fa1026867bd`, respectively; both integrity values also match the coordinated publication evidence.

The official installation passed the complete local workflow: build, root checks, isolated skill installation, site types/tests/build, both site-browser engines, avatars, typography, reading controls, dashboard, craft browser and native checks. The site still builds 34 guides plus the 404 page, and the expanded matrix retains its 12 profiles and 36 captures. Canonical skill contents remain byte-identical to commit `55f9e6e`. Logs, registry comparisons, fresh screenshots and the static-output hash inventory are saved in `work/doc-unification/design/final-official`. This establishes local readiness; CI, hosted bytes and the destination-before-redirect deployment gate remain separate acceptance steps.
