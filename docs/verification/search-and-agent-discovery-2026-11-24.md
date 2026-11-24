# Search and agent discovery verification

## Production baseline on November 24, 2026

The production site identified its revision as `ac7e6b7`. All 57 URLs in its sitemap returned HTML and declared a canonical URL. The homepage and the Color guide advertised social images that returned HTTP 404. All 57 pages referenced the same unserved image API pattern. None declared a Markdown alternate or provided JSON-LD. The existing Markdown downloads, robots file and topic index were reachable. An unknown path returned HTTP 404 and the production Pages alias returned `X-Robots-Tag: noindex`. [Production sitemap](https://design.master.co/sitemap.xml) · [Deployment identity](https://design.master.co/site-release.json)

## Local production build

| Surface | Verification |
| --- | --- |
| Document metadata | All 57 guides have distinct titles and descriptions, a single visible H1 and a self-referencing canonical URL. Thirteen search titles give additional context to short headings or the homepage tagline. The homepage publishes a `WebSite` identity. Each of the 56 topic pages identifies itself as a `TechArticle` with its visible heading and section. |
| Crawl coverage | The robots sitemap directive, XML locations, HTML canonicals and Open Graph URLs agree on the configured origin, including the homepage slash. The sitemap contains exactly the 57 guide URLs. The error page declares `noindex`. A separate build using `https://guide.example.test` passed the same discovery checks. |
| Sharing | All 57 Open Graph and X cards resolve to that page's 1200 × 630 PNG. Each file returned `image/png` through the Pages emulator. The declared sizes match the PNG headers. The homepage card was also inspected at its rendered size. |
| Markdown | Each HTML head links directly to its Markdown and to `/llms.txt`. All 57 downloads matched their portable sources byte for byte and returned a canonical HTTP link to the HTML page. Appending `.md` to a topic URL or requesting `/index.md` made one permanent redirect to the corresponding download. |
| Agent index and full text | The topic index groups all 57 documents by guide category. The full-text export includes each source, its HTML citation and the license. Both exports were parsed as Markdown. All 252 links to local Markdown resolved, including their fragment targets. |
| Reproducibility | Two builds in different directories with the final dependency pins produced identical bytes for all 326 files, including HTML, both indexes, the sitemap, robots, Pages rules, downloads, license and PNGs. |

The sitemap omits modification dates because the catalog has no authoritative per-page revision dates. Agents can fetch a single topic from the 9 KB index or explicitly request the 219 KB full guide. The full guide and internal search data are served with `noindex`. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [llms.txt proposal](https://llmstxt.org/)

## Reproducing the checks

Run `bun run check:site`, `bun run build:site` and `bun run test:site` with Bun 1.4.4 and Node 24. The browser command checks the built HTML, XML, Markdown, PNG files and Pages rules before its interaction tests. Chromium 153 and WebKit 26.6 also followed a guide link and discovered the destination's Markdown with JavaScript disabled.

The final site checks used `@master/internal-site` 0.3.4 and `@master/ui` 2.1.0. Type checks passed with one existing Svelte accessibility warning about an event listener on the interaction study's group element.

The pinned Wrangler emulator exercised actual HTTP responses using its latest supported compatibility date, `2026-09-10`. Production retains its configured date. The live observations above describe the deployed baseline. The candidate checks concern local output and do not measure search rankings, index inclusion or AI referrals.
