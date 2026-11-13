# Deploying the Design website

The website is a static Cloudflare Pages project. Its lifecycle is independent of the portable skill's tag and GitHub release workflow: publishing a skill version is not a prerequisite, and a site revision has no version of its own.

## Delivery

The site is delivered through Cloudflare Pages' Git integration, the way Master CSS and Master UI deliver their sites. GitHub holds no Cloudflare credential and never uploads the site.

1. Every push to `main` runs `.github/workflows/deploy-site.yml`. Its `validation` job calls `check.yml`, which installs `bun.lock` unchanged, verifies the exact first-party package pins, checks the skill and site, builds the site, runs the browser scenarios and only then uploads the tested output as `master-design-site-<commit>`.
2. The `deploy-site` job plans the delivery (`node scripts/pages-site-release.mjs plan`), checks out the exact commit, rebuilds it and requires the rebuilt `site/out` to equal the tested artifact file for file before writing `site-release.json`, the public identity of the build (`identity`). It then records the size and SHA-256 of every output file (`manifest`).
3. `deliver` publishes the manifest as the tag `site-manifest/main/<commit>`, reads it back over public Git, and moves the `pages-stable` branch to the commit, fast-forward only. It then waits for the Cloudflare Pages check of that commit, reads `site-release.json` from the immutable `<hash>.<subdomain>` deployment (which must answer `X-Robots-Tag: noindex`) and, in `production` mode, waits for `https://design.master.co` to serve the same identity. `release-artifacts/site-delivery.json`, kept as a workflow artifact, records every external write and its outcome; read it before retrying a failed delivery.
4. Cloudflare builds `pages-stable` with `bun run build:site:cloudflare-pages` (`scripts/build-site-hosted.sh`). Before installing anything it requires the manifest tag of this exact commit. It rebuilds and fails unless the output matches the manifest byte for byte and `pages-stable` still points at the commit. A differing build cannot become a new baseline.

The gate is validation, not a release: a revision is delivered once `check.yml` passes for it. Deliveries are serialized; when pushes arrive faster than Pages builds, the newest waiting push is delivered and `pages-stable` fast-forwards past the skipped ones.

### Where the manifest lives

A site revision has no GitHub release to attach its manifest to, and attaching it to a skill release would tie the site to the skill's lifecycle. Each manifest is therefore a lightweight tag, `site-manifest/main/<commit>`, pointing at a commit whose only parent is the delivered commit and whose tree holds only `site.manifest.json`. Git object ids make the bytes content-addressed and bind them to their source revision; Cloudflare reads them with an anonymous `git fetch` from the public repository, with no API rate limit or credential. The delivery creates each tag once with `GITHUB_TOKEN` and verifies an existing tag by its tree id; it never moves, replaces or deletes one. The tags are not releases, so the Releases page keeps listing only skill versions, and `scripts/release.mjs` considers only `v*` tags.

## Configuration

Until the three repository variables exist, `deploy-site` validates every push and delivers nothing, saying so in a notice.

| GitHub repository variable | Value |
| --- | --- |
| `CLOUDFLARE_PAGES_PROJECT` | The Pages project's name |
| `CLOUDFLARE_PAGES_SUBDOMAIN` | Its actual `<name>.pages.dev` subdomain, without scheme or path; do not infer it from the project name |
| `CLOUDFLARE_PAGES_MODE` | `bootstrap` until design.master.co is attached to the project, then `production` |

The Pages project is connected to `master-co/design` with:

| Setting | Value |
| --- | --- |
| Production branch | `pages-stable` |
| Preview deployments | None |
| Build watch paths | Include `*`, exclude nothing |
| Root directory | The repository root (empty) |
| Build command | `MASTER_DESIGN_PAGES_PROJECT=<project> MASTER_DESIGN_PAGES_SUBDOMAIN=<subdomain>.pages.dev bun run build:site:cloudflare-pages` |
| Build output directory | `site/out` |
| Custom domain | `design.master.co` |

| Cloudflare build variable | Value |
| --- | --- |
| `BUN_VERSION` | `1.4.4`, the `packageManager` pin |
| `NODE_VERSION` | `24.20.0`, as in `.node-version` |
| `SKIP_DEPENDENCY_INSTALL` | `1`; the build script runs the frozen install after proving the delivery |
| `MASTER_DESIGN_PAGES_PROJECT` | The project's name, as in the build command |
| `MASTER_DESIGN_PAGES_SUBDOMAIN` | Its `pages.dev` subdomain, as in the build command |

Leave `PUBLIC_URL` unset: the build script sets the canonical origin, and a configured value that differs fails the build. `wrangler.jsonc` at the repository root is the project's configuration; its `name` must be the project's name, and the hosted build fails otherwise. Pages replaces dashboard variables with that file's `vars` on every deployment, so after its checks pass the build script writes the five build variables above, with the exact Node version it ran, into the build's copy of the file; the identity values are also in the build command because Pages can apply the file before the script runs.

A Direct Upload project cannot be connected to Git later. The `master-design` project created for the former Wrangler upload, if it is a Direct Upload project, is replaced by a Git-connected project; move `design.master.co` to it and update `name` in `wrangler.jsonc` if the new project has another name.

Protect the delivery refs without blocking the workflow: on `pages-stable`, block force pushes and deletions, and require neither pull requests nor status checks, because `GITHUB_TOKEN` moves it; on tags matching `site-manifest/**`, restrict updates and deletions but allow creation.

Start with `bootstrap`: the delivery is verified on its immutable `pages.dev` deployment only. Once design.master.co serves the project, prove it from the retained manifest with `node scripts/pages-site-release.mjs canonical <site.manifest.json>` and switch the variable to `production`, after which every delivery also waits for the canonical origin. `node scripts/pages-release-target.mjs` checks the project, its Git source, its production branch and its domain with a read-only Cloudflare token you supply (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PAGES_PROJECT`); the workflow never has one.

Rerun the failed `deploy-site` job to retry: an existing manifest tag with the same bytes and a `pages-stable` that already points at the commit are verified, not written again. If Cloudflare's build of that commit failed, retry the deployment in Cloudflare or push again; a rerun only waits for a check. A rerun of an older run fails at the fast-forward once a newer commit has been delivered. Never force-push or move `pages-stable` by hand, never move or replace a manifest tag, and never rewrite `main` history that `pages-stable` already contains.

Run `bun run check:site-delivery` and `bun run test:site-delivery` after changing the workflow or the delivery scripts; `bun run check` runs both.

## Reproducible output

Cloudflare rebuilds the commit in another directory, so the output must not depend on the checkout path. Astro hashes each island's absolute source path into its `uid`; `site/scripts/stable-island-ids.mjs` rewrites it after every build from the island's public attributes. A delivery fails before publishing anything if the rebuild differs from the tested artifact.

## Exact package verification

Run `bun run check:site-pins` after a clean, frozen install. Every direct `@master/*` site dependency must have an exact registry version, and the installed package metadata must agree with that pin. Ranges, workspace paths, local archives and installed candidates whose versions differ from the manifest fail the check. The validation job and the delivery job run the same verifier, and Cloudflare installs the same lockfile.

A candidate package extracted locally for integration is not a release-ready install. After the required versions are published, update the manifest and lockfile, reinstall without the candidate modifications, then repeat the checks. The verifier does not weaken that requirement for CI.

## Custom domain readiness

Associate `design.master.co` with the Git-connected Pages project through Pages' custom-domain flow. Use the actual project subdomain returned by Cloudflare as the DNS target; a Pages subdomain can differ from the requested project name. Do not guess it or create an unrelated CNAME before associating the custom domain.

Then verify the Pages domain status, DNS resolution and HTTPS response for the homepage, a deep guideline URL and a generated asset. Verify canonical links, `/sitemap.xml`, `/llms.txt` and the 404 response. A successful `pages.dev` deployment does not alone prove that the custom domain is ready.

Read-only verification on 2026-11-12, after the coordinated infrastructure setup, confirmed:

- The Pages project `master-design` listed `master-design-a5q.pages.dev` and the associated `design.master.co` custom domain.
- The authoritative Cloudflare nameserver resolved `design.master.co` to proxied Cloudflare addresses. The configured target, verified during setup, was `master-design-a5q.pages.dev`.
- `master.co` uses Cloudflare nameservers `mcgrory.ns.cloudflare.com` and `tori.ns.cloudflare.com`.

That project was set up for the former Wrangler upload. The website workflow does not provision projects or alter DNS.
