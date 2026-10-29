# Master Design

An Agent Skill for building and refining web interfaces with deliberate surfaces, typography, spacing and interaction.

Use one entry, **`$master-design`**. It follows the project's framework, brand, fonts and density, then loads only the relevant craft references. An optional **Aron preferences** profile captures a restrained near-white treatment without making it the default for every project.

## Install

```sh
npx skills add master-co/design --skill master-design
```

For the current local checkout:

```sh
npx skills add ./ --skill master-design
```

Choose the target project and agent through the installer. The installed skill is self-contained; the example app, Bun, Node, browser tools and companion article are not installation requirements.

## Use

```text
Use $master-design to refine this interface while preserving its brand,
fonts and compact density. Implement and verify the affected states.
```

```text
Use $master-design with Aron preferences for this workspace.
Keep its text clear, its surfaces quiet and its control feedback stable.
```

```text
Use $master-design to review these controls. Explain concrete findings
and verification limits without modifying the project.
```

The skill covers surfaces, geometry, images, typography, layout, states, motion and local materials. It distinguishes measured results, derived geometry and visual judgment. Missing browser access is reported rather than replaced with a claim of pixel verification.

## Companion study

[Interface craft](docs/article-map.md) connects every topic to 35 baseline diagrams, four avatar studies and two interaction studies. The five-language [companion article](https://aron.tw/blog/interface-craft) explains the mechanisms with original illustrations. Its complete history and original illustrations remain in the article repository.

The standalone [workspace example](examples/interface-craft/README.md) reuses its coherent illustrative data and desktop geometry, with real project search, filtering, selection and responsive navigation. It contains no backend. The [avatar-stack study](examples/interface-craft/avatar/README.md) adds four original single-variable diagrams and a photo/initials participant example; the article includes these four studies alongside its 35 baseline diagrams.

## Develop

Use Bun 1.4.4 and Node 24.20.0 for repository tooling:

```sh
bun install --frozen-lockfile
bun run build
bun run demo
```

The demo server prints its local URL. In a second terminal:

```sh
bun run check
bun run test:install
bun run test:avatars
bun run test:dashboard
bun run test:browser
bun run test:native
bun run test:forward
bun run capture
bun run capture:avatars
```

Install the Playwright Chromium and WebKit binaries before browser checks if needed. Exports, hashes and screenshots are written to ignored `artifacts/`. See [verification](docs/verification.md) for methods and actual results.

## Contribute

Read the [contribution guide](CONTRIBUTING.md) for scope, evidence and checks. Use the [issue forms](https://github.com/master-co/design/issues/new/choose) for a reproducible problem, craft proposal or documentation question; focused fixes can go straight to a pull request. See the [changelog](CHANGELOG.md) for the current version.

## License and sources

MIT, following Master CSS's Aoyue Design LLC attribution. Self-hosted fonts retain their included OFL notices. The existing companion article and original illustration archive retain their current licensing. See [sources](docs/sources.md) for original research and the scope of the examples.
