# Deploying the Design website

The website is a static Cloudflare Pages project. Its lifecycle is independent of the portable skill's tag and GitHub release workflow.

## Validated deployment

`.github/workflows/deploy-site.yml` runs on `main` pushes and manual dispatches of `main`. It calls the existing `check.yml` workflow, which installs `bun.lock` unchanged, verifies the exact first-party package pins, checks the skill and site, builds the site and runs the browser scenarios. Only a successful check uploads `master-design-site-<commit SHA>` from `site/out`.

The deployment job downloads that tested artifact from the same workflow run and uses the locally installed, pinned Wrangler executable. It does not rebuild different content after verification. The commit SHA is attached to the Pages deployment.

Repository configuration:

| Setting | Purpose |
| --- | --- |
| Secret `CLOUDFLARE_API_TOKEN` | Cloudflare Pages deployment access |
| Secret `CLOUDFLARE_ACCOUNT_ID` | Account containing the Pages project |
| Optional variable `CLOUDFLARE_PAGES_PROJECT` | Existing Pages project name; defaults to `master-design` |

If either secret is absent, the workflow retains the validated artifact and explicitly reports that deployment was skipped in the job notice and summary. It does not create credentials, projects or DNS records. `site/wrangler.jsonc` records the default project and `out` directory.

## Exact package verification

Run `bun run check:site-pins` after a clean, frozen install. Every direct `@master/*` site dependency must have an exact registry version, and the installed package metadata must agree with that pin. Ranges, workspace paths, local archives and installed candidates whose versions differ from the manifest fail the check. The reusable validation job and deployment job run the same verifier.

A candidate package extracted locally for integration is not a release-ready install. After the required versions are published, update the manifest and lockfile, reinstall without the candidate modifications, then repeat the checks. The verifier does not weaken that requirement for CI.

## Custom domain readiness

Before the first production deployment, provision the Pages project in the intended Cloudflare account and associate `design.master.co` through Pages' custom-domain flow. Use the actual project subdomain returned by Cloudflare as the DNS target; a Pages subdomain can differ from the requested project name. Do not guess it or create an unrelated CNAME before associating the custom domain.

Then verify the Pages domain status, DNS resolution and HTTPS response for the homepage, a deep guideline URL and a generated asset. Verify canonical links, `/sitemap.xml`, `/llms.txt` and the 404 response. A successful `pages.dev` deployment does not alone prove that the custom domain is ready.

Read-only verification on 2026-11-12, after the coordinated infrastructure setup, confirms:

- The Pages project `master-design` lists `master-design-a5q.pages.dev` and the associated `design.master.co` custom domain.
- The authoritative Cloudflare nameserver resolves `design.master.co` to proxied Cloudflare addresses. The configured target, verified during setup, is `master-design-a5q.pages.dev`.
- `master.co` uses Cloudflare nameservers `mcgrory.ns.cloudflare.com` and `tori.ns.cloudflare.com`.

This supersedes the initial pre-provisioning inspection, which found no project and an NXDOMAIN response. No assets had been deployed at the time of this readiness check; production HTTPS, page and asset checks still follow the first validated deployment. The website workflow does not provision the project or alter DNS.
