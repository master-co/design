// Holds the website workflow to its contract: the site is delivered through the pages-stable Git ref
// only after check.yml validated the exact commit, without any Cloudflare credential, and Cloudflare
// Pages deploys only output that matches the published manifest. Run with `bun run check:site-delivery`.
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { parse } from 'yaml'

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const deployWorkflow = parse(read('.github/workflows/deploy-site.yml'))
const checkWorkflow = parse(read('.github/workflows/check.yml'))

assert.deepEqual(deployWorkflow.on.push.branches, ['main'], 'Only main delivers the site')
assert.equal(deployWorkflow.concurrency['cancel-in-progress'], false, 'Keep the delivery serialized while Pages builds')
assert.deepEqual(deployWorkflow.permissions, { contents: 'read' })
assert.equal(deployWorkflow.jobs.validation.uses, './.github/workflows/check.yml', 'Deliver only what the full checks validated')
assert.equal(deployWorkflow.jobs.validation.if, "${{ github.ref == 'refs/heads/main' }}")

const site = deployWorkflow.jobs['deploy-site']
assert.equal(site.needs, 'validation', 'Site delivery follows the validation of the same commit')
assert.deepEqual(site.permissions, { contents: 'write', checks: 'read' })
assert.equal(site.env.PUBLIC_URL, 'https://design.master.co', 'Only the canonical site is delivered')
for (const [name, variable] of [['PAGES_PROJECT', 'CLOUDFLARE_PAGES_PROJECT'], ['PAGES_SUBDOMAIN', 'CLOUDFLARE_PAGES_SUBDOMAIN'], ['PAGES_RELEASE_MODE', 'CLOUDFLARE_PAGES_MODE']]) {
  assert.equal(site.env[name], `\${{ vars.${variable} }}`)
}
const checkout = site.steps.find(step => step.uses?.startsWith('actions/checkout@'))
assert.equal(checkout?.with.ref, '${{ github.sha }}', 'Deliver the exact validated commit')
assert.equal(checkout.with['persist-credentials'], false)
const planStep = site.steps.find(step => step.id === 'plan')
assert.equal(planStep?.run, 'node scripts/pages-site-release.mjs plan')
for (const step of site.steps.slice(site.steps.indexOf(planStep) + 1)) {
  assert.match(step.if ?? '', /steps\.plan\.outputs\.deliver == 'true'/, `Only a planned delivery may run: ${step.name ?? step.uses}`)
}

// The rebuilt output must equal the exact artifact the validation job tested in browsers.
const tested = checkWorkflow.jobs.check.steps.find(step => step.uses?.startsWith('actions/upload-artifact@') && step.with.path === 'site/out')
assert.equal(tested?.with.name, 'master-design-site-${{ github.sha }}')
assert.equal(tested.with['include-hidden-files'], true, 'Keep every tested output file')
const checkRuns = checkWorkflow.jobs.check.steps.map(step => step.run ?? '')
assert.ok(checkRuns.indexOf('bun run check') >= 0, 'Validation runs the delivery checks and tests through bun run check')
assert.ok(checkRuns.indexOf('bun run build:site') < checkRuns.indexOf('bun run test:site'), 'Validation tests the built site')
assert.ok(checkWorkflow.jobs.check.steps.indexOf(tested) > checkRuns.lastIndexOf('bun run test:site'), 'Upload only the tested output')
const download = site.steps.find(step => step.uses?.startsWith('actions/download-artifact@'))
assert.equal(download?.with.name, tested.with.name)
assert.equal(download.with.path, 'release-artifacts/tested-site')

const siteRuns = site.steps.map(step => step.run ?? '').join('\n')
let position = -1
for (const command of ['pages-site-release.mjs plan', 'bun install --frozen-lockfile', 'bun run check:site-pins', 'bun run build:site',
  'pages-site-release.mjs identity release-artifacts/tested-site', 'pages-site-release.mjs manifest', 'pages-site-release.mjs deliver']) {
  const next = siteRuns.indexOf(command, position + 1)
  assert.ok(next > position, `Site delivery command must follow its prerequisites: ${command}`)
  position = next
}
const delivery = site.steps.find(step => step.run === 'node scripts/pages-site-release.mjs deliver')
assert.equal(delivery.env.GITHUB_TOKEN, '${{ secrets.GITHUB_TOKEN }}')
assert.equal(site.steps.filter(step => step.env?.GITHUB_TOKEN).length, 1, 'Do not expose the repository write token while building the site')
const receipt = site.steps.find(step => step.uses?.startsWith('actions/upload-artifact@') && step.with.path === 'release-artifacts/site-delivery.json')
assert.equal(receipt?.if, '${{ always() && steps.plan.outputs.deliver == \'true\' }}', 'Keep the receipt when a delivery step fails after an external write')
assert.equal(receipt.with.name, 'site-delivery-${{ github.sha }}-${{ github.run_attempt }}', 'Retain each workflow attempt independently')

for (const file of readdirSync(new URL('../.github/workflows/', import.meta.url))) {
  assert.doesNotMatch(read(`.github/workflows/${file}`), /CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|wrangler pages deploy/,
    `${file}: Git delivery must not use Cloudflare credentials or upload commands`)
}

const hosted = read('scripts/build-site-hosted.sh')
assert.ok(hosted.indexOf('hosted-prepare') < hosted.indexOf('bun install --frozen-lockfile'), 'Prove the delivery before installing')
assert.ok(hosted.indexOf('hosted-verify') > hosted.indexOf('bun run build:site'), 'Verify the output after building it')
assert.doesNotMatch(hosted, /^\s*eval\b/m, 'Never evaluate downloaded delivery metadata as shell code')
const { scripts } = JSON.parse(read('package.json'))
assert.equal(scripts['build:site:cloudflare-pages'], 'bash scripts/build-site-hosted.sh')
assert.ok(scripts.check.includes('node scripts/site-delivery-check.mjs') && scripts.check.includes('node --test tests/*.test.mjs'),
  'bun run check must hold the workflow to this contract and run the delivery tests')
const wrangler = JSON.parse(read('wrangler.jsonc'))
assert.equal(wrangler.pages_build_output_dir, 'site/out', 'Pages reads the root Wrangler configuration')
assert.ok(!existsSync(new URL('../site/wrangler.jsonc', import.meta.url)), 'Keep one Wrangler configuration, at the Pages root')
const headers = read('site/public/_headers')
for (const host of ['https://:project.pages.dev/*', 'https://:deployment.:project.pages.dev/*']) {
  assert.match(headers, new RegExp(`^${host.replaceAll('.', '\\.').replaceAll('*', '\\*')}\\n  X-Robots-Tag: noindex$`, 'm'), `pages.dev hosts must answer noindex: ${host}`)
}
assert.match(read('site/astro.config.ts'), /stabilizeIslandIdsIn\(/, 'Astro island ids must not depend on the checkout path')

process.stdout.write('Validated gated, exact-output Pages Git delivery of the website without Cloudflare credentials.\n')
