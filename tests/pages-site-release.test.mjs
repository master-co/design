import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { ciMetadata, hostedBuildConfig, hostedMetadata, planDelivery } from '../scripts/pages-site-release.mjs'
import { createManifest, gitBlobId, jsonBytes, manifestTag, manifestTreeId, outputInventory, prepareIdentity, sha256 } from '../scripts/pages-site-manifest.mjs'

const scripts = new URL('../scripts/', import.meta.url)
const revision = 'a'.repeat(40)
const metadata = { repository: 'master-co/design', revision, channel: 'main', deliveryBranch: 'pages-stable',
  project: 'fixture', subdomain: 'fixture-suffix.pages.dev', origin: 'https://design.master.co' }
const ci = { GITHUB_REPOSITORY: metadata.repository, GITHUB_EVENT_NAME: 'push', GITHUB_SHA: revision, GITHUB_REF_NAME: 'main',
  PUBLIC_URL: metadata.origin, PAGES_PROJECT: metadata.project, PAGES_SUBDOMAIN: metadata.subdomain, PAGES_RELEASE_MODE: 'bootstrap' }
const cf = { CF_PAGES: '1', CF_PAGES_BRANCH: metadata.deliveryBranch, CF_PAGES_COMMIT_SHA: revision,
  CF_PAGES_URL: `https://12345678.${metadata.subdomain}`, MASTER_DESIGN_PAGES_PROJECT: metadata.project,
  MASTER_DESIGN_PAGES_SUBDOMAIN: metadata.subdomain }
const runGit = () => Buffer.from(revision + '\n')
const pagesFiles = { '404.html': '<p>Not found</p>', '_headers': '/*\n  X-Content-Type-Options: nosniff\n', '_redirects': '/old /new 301\n' }
const manifestCommit = 'c'.repeat(40)

// A `git` executable for the fixtures: the checkout, the manifest tag and pages-stable as the public remote serves them.
const fakeGit = `#!/usr/bin/env node
import fs from 'node:fs'
const args = process.argv.slice(2)
const { metadata: m, tag, commit, blob, tree } = JSON.parse(fs.readFileSync('fixture.json'))
const remote = fs.existsSync('remote.json') ? JSON.parse(fs.readFileSync('remote.json')) : { manifest: true }
if (args[0] === 'rev-parse') console.log(m.revision)
else if (args[0] === 'ls-remote' && args.includes('--heads')) console.log((process.env.PAGES_FIXTURE_POINTER || m.revision) + '\\trefs/heads/pages-stable')
else if (args[0] === 'ls-remote') { if (remote.manifest) console.log(commit + '\\trefs/tags/' + tag) }
else if (args[0] === 'fetch') {}
else if (args[0] === 'cat-file' && args[1] === '-t') console.log('commit')
else if (args[0] === 'cat-file' && args[1] === 'commit') process.stdout.write('tree ' + tree + '\\nparent ' + m.revision + '\\n\\nSite output manifest\\n')
else if (args[0] === 'ls-tree') console.log('100644 blob ' + blob + '\\tsite.manifest.json')
else if (args[0] === 'cat-file' && args[1] === 'blob') process.stdout.write(fs.readFileSync(process.env.PAGES_FIXTURE_MANIFEST || 'release-artifacts/site.manifest.json'))
else { console.error('Unexpected git request'); process.exit(1) }
`
async function writeFixture(root, data) {
  await writeFile(path.join(root, 'fixture.json'), JSON.stringify({ metadata, tag: manifestTag(metadata), commit: manifestCommit,
    blob: gitBlobId(data), tree: manifestTreeId(data) }))
  await writeFile(path.join(root, 'tools/git'), fakeGit, { mode: 0o755 })
}

test('CI binds the exact validated source and an explicit delivery mode', () => {
  assert.deepEqual(ciMetadata(ci, runGit), metadata)
  assert.deepEqual(ciMetadata({ ...ci, PAGES_RELEASE_MODE: 'production' }, runGit), metadata)
  assert.deepEqual(ciMetadata({ ...ci, GITHUB_EVENT_NAME: 'workflow_dispatch' }, runGit), metadata, 'A rerun of main delivers too')
  for (const wrong of [
    { GITHUB_REPOSITORY: 'fork/design' }, { GITHUB_EVENT_NAME: 'pull_request' }, { GITHUB_SHA: 'f'.repeat(40) },
    { GITHUB_REF_NAME: 'next' }, { GITHUB_REF_NAME: 'pages-stable' }, { PUBLIC_URL: 'https://fixture.pages.dev' }, { PUBLIC_URL: undefined },
    { PAGES_PROJECT: undefined }, { PAGES_SUBDOMAIN: 'fixture' }, { PAGES_RELEASE_MODE: undefined }, { PAGES_RELEASE_MODE: 'maybe' }
  ]) assert.throws(() => ciMetadata({ ...ci, ...wrong }, runGit))
})

test('every validated push to main delivers once the Pages variables exist', async t => {
  assert.deepEqual(planDelivery({ configured: true, channel: 'main' }), { deliver: true })
  assert.throws(() => planDelivery({ configured: true, channel: 'next' }), /Only main/)
  const unconfigured = planDelivery({ configured: false, channel: 'main' })
  assert.equal(unconfigured.deliver, false)
  assert.match(unconfigured.reason, /CLOUDFLARE_PAGES_PROJECT/)
  // The real command writes the step output and reports why nothing was delivered.
  const root = await mkdtemp(path.join(tmpdir(), 'master-design-pages-plan-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const output = path.join(root, 'output')
  const stdout = execFileSync(process.execPath, [fileURLToPath(new URL('pages-site-release.mjs', scripts)), 'plan'], {
    env: { PATH: process.env.PATH, GITHUB_OUTPUT: output, GITHUB_REF_NAME: 'main' }, encoding: 'utf8' })
  assert.equal(await readFile(output, 'utf8'), 'deliver=false\n')
  assert.match(stdout, /::notice title=Site delivery deferred::/)
  assert.throws(() => execFileSync(process.execPath, [fileURLToPath(new URL('pages-site-release.mjs', scripts)), 'plan'], {
    env: { PATH: process.env.PATH, GITHUB_OUTPUT: output, GITHUB_REF_NAME: 'main', PAGES_PROJECT: 'fixture' }, stdio: 'pipe' }),
  'A partial configuration fails instead of silently skipping')
})

test('Cloudflare maps the delivery ref to the channel and verifies its actual deployment host', () => {
  assert.deepEqual(hostedMetadata(cf, runGit), metadata)
  assert.deepEqual(hostedMetadata({ ...cf, PUBLIC_URL: metadata.origin }, runGit), metadata)
  for (const wrong of [
    { CF_PAGES: undefined }, { CF_PAGES_BRANCH: 'main' }, { CF_PAGES_BRANCH: 'codex/pages-stable' }, { CF_PAGES_COMMIT_SHA: 'f'.repeat(40) },
    { PUBLIC_URL: 'https://preview.example' }, { CF_PAGES_URL: 'https://design.master.co' },
    { CF_PAGES_URL: 'https://12345678.fixture.pages.dev' }, { CF_PAGES_URL: 'https://main.fixture-suffix.pages.dev' },
    { MASTER_DESIGN_PAGES_PROJECT: '' }, { MASTER_DESIGN_PAGES_SUBDOMAIN: '' }
  ]) assert.throws(() => hostedMetadata({ ...cf, ...wrong }, runGit))
  assert.throws(() => hostedMetadata(cf, () => 'f'.repeat(40)), /source identity/)
})

test('the real hosted shell command fails before installing tools when the delivery is absent', async t => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'master-design-pages-shell-'))
  t.after(() => rm(temporary, { recursive: true, force: true }))
  const script = fileURLToPath(new URL('build-site-hosted.sh', scripts))
  assert.throws(() => execFileSync('bash', [script], { env: { PATH: process.env.PATH, TMPDIR: temporary }, stdio: 'pipe' }), /Command failed/)
  assert.deepEqual(await readdir(temporary), [], 'The rejected build removes its temporary evidence directory')
})

test('hosted Pages configuration retains build inputs without copying environment secrets', () => {
  const config = { name: 'fixture', compatibility_date: '2026-11-12', pages_build_output_dir: 'site/out',
    vars: { PUBLIC_LABEL: 'Keep', JSON_VALUE: { nested: true }, NODE_VERSION: 'stale' },
    kv_namespaces: [{ binding: 'CACHE', id: 'existing-kv' }],
    env: { production: { vars: { PUBLIC_LABEL: 'Production' }, compatibility_flags: ['nodejs_compat'] },
      preview: { vars: { PUBLIC_LABEL: 'Preview' }, kv_namespaces: [{ binding: 'CACHE', id: 'preview-kv' }] } } }
  const original = structuredClone(config)
  const previous = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'must-not-copy-secret'
  try {
    const result = hostedBuildConfig(config, metadata, { packageManager: 'bun@1.4.4' })
    for (const vars of [result.vars, result.env.production.vars]) {
      assert.equal(vars.NODE_VERSION, process.versions.node)
      assert.equal(vars.BUN_VERSION, '1.4.4')
      assert.equal(vars.SKIP_DEPENDENCY_INSTALL, '1')
      assert.equal(vars.MASTER_DESIGN_PAGES_PROJECT, metadata.project)
      assert.equal(vars.MASTER_DESIGN_PAGES_SUBDOMAIN, metadata.subdomain)
      assert.equal(vars.OPENAI_API_KEY, undefined)
    }
    assert.deepEqual(result.vars.JSON_VALUE, config.vars.JSON_VALUE)
    assert.equal(result.env.production.vars.JSON_VALUE, undefined, 'Production must not inherit local-only vars')
    assert.equal(result.vars.PUBLIC_LABEL, 'Keep')
    assert.equal(result.env.production.vars.PUBLIC_LABEL, 'Production')
    assert.deepEqual(result.kv_namespaces, config.kv_namespaces)
    assert.deepEqual(result.env.preview, config.env.preview)
    assert.deepEqual(result.env.production.compatibility_flags, config.env.production.compatibility_flags)
    assert.deepEqual(hostedBuildConfig(result, metadata, { packageManager: 'bun@1.4.4' }), result, 'Every subsequent deploy retains the same values')
  } finally { if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous }
  assert.deepEqual(config, original)
  assert.throws(() => hostedBuildConfig(config, { ...metadata, project: 'not/a/project' }, { packageManager: 'bun@1.4.4' }))
  assert.throws(() => hostedBuildConfig({ ...config, name: 'master-design' }, metadata, { packageManager: 'bun@1.4.4' }), /name the Pages project/)
  assert.throws(() => hostedBuildConfig({ ...config, pages_build_output_dir: 'out' }, metadata, { packageManager: 'bun@1.4.4' }), /output directory/)
  assert.throws(() => hostedBuildConfig(config, metadata, { packageManager: 'bun@latest' }), /pinned Bun/)
  assert.throws(() => hostedBuildConfig(config, metadata, { packageManager: 'bun@1.4.4', nodeVersion: '$(untrusted)' }), /actual hosted Node/)
})

test('the real hosted shell builds only the published revision and rejects altered bytes', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'master-design-pages-hosted-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const name of ['scripts', 'tools', 'verified/assets']) await mkdir(path.join(root, name), { recursive: true })
  for (const name of ['build-site-hosted.sh', 'pages-site-release.mjs', 'pages-site-manifest.mjs', 'pages-release-github.mjs']) {
    await copyFile(new URL(name, scripts), path.join(root, 'scripts', name))
  }
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ packageManager: 'bun@1.4.4' }))
  const originalConfig = jsonBytes({ name: 'fixture', pages_build_output_dir: 'site/out', vars: { EXISTING: 'retained' },
    kv_namespaces: [{ binding: 'CACHE', id: 'existing-kv' }] })
  await writeFile(path.join(root, 'wrangler.jsonc'), originalConfig)
  const payload = { 'index.html': '<p>Delivery fixture</p>', 'assets/a.css': 'a{color:red}', ...pagesFiles }
  for (const [name, contents] of Object.entries(payload)) await writeFile(path.join(root, 'verified', name), contents)
  await prepareIdentity(path.join(root, 'verified'), metadata)
  const manifest = await createManifest(path.join(root, 'verified'), metadata)
  await writeFile(path.join(root, 'manifest.json'), jsonBytes(manifest))
  await writeFile(path.join(root, 'payload.json'), JSON.stringify(payload))
  await writeFixture(root, jsonBytes(manifest))
  // The hosted build reads only public Git; any network request fails the fixture.
  await writeFile(path.join(root, 'offline.mjs'), `globalThis.fetch = async () => { throw new Error('Unexpected network request') }\n`)
  await writeFile(path.join(root, 'tools/bun'), `#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
fs.appendFileSync('trace.txt', process.argv.slice(2).join(' ') + '\\n')
if (process.argv[2] === 'install') {}
else if (process.argv[2] === 'run' && process.argv[3] === 'build:site') {
  if (process.env.PUBLIC_URL !== 'https://design.master.co') throw new Error('Wrong build environment')
  fs.rmSync('site/out', { recursive: true, force: true })
  for (const [name, contents] of Object.entries(JSON.parse(fs.readFileSync('payload.json')))) {
    fs.mkdirSync(path.dirname('site/out/' + name), { recursive: true }); fs.writeFileSync('site/out/' + name, contents)
  }
} else throw new Error('Unexpected bun command')
`, { mode: 0o755 })
  const env = { PATH: `${path.join(root, 'tools')}${path.delimiter}${process.env.PATH}`, HOME: root, TMPDIR: root,
    NODE_OPTIONS: `--import=${pathToFileURL(path.join(root, 'offline.mjs')).href}`, ...cf, PAGES_FIXTURE_MANIFEST: path.join(root, 'manifest.json') }
  const hosted = (overrides = {}) => execFileSync('bash', [path.join(root, 'scripts/build-site-hosted.sh')], { cwd: root, env: { ...env, ...overrides }, stdio: 'pipe', encoding: 'utf8' })
  const result = hosted()
  assert.ok(result.includes(manifest.buildDigest))
  const config = JSON.parse(await readFile(path.join(root, 'wrangler.jsonc'), 'utf8'))
  assert.equal(config.vars.MASTER_DESIGN_PAGES_PROJECT, metadata.project)
  assert.equal(config.vars.MASTER_DESIGN_PAGES_SUBDOMAIN, metadata.subdomain)
  assert.equal(config.vars.NODE_VERSION, process.versions.node)
  assert.equal(config.vars.BUN_VERSION, '1.4.4')
  assert.equal(config.vars.EXISTING, 'retained')
  assert.deepEqual(config.kv_namespaces, [{ binding: 'CACHE', id: 'existing-kv' }])
  assert.deepEqual(await outputInventory(path.join(root, 'site/out')), manifest.files, 'Config generation cannot modify the verified public output')
  assert.ok((await readFile(path.join(root, 'manifest.json'))).equals(jsonBytes(manifest)), 'The immutable CI manifest is unchanged')
  assert.deepEqual((await readFile(path.join(root, 'trace.txt'), 'utf8')).trim().split('\n'), ['install --frozen-lockfile', 'run build:site'])
  const rejected = async (overrides, message) => {
    await writeFile(path.join(root, 'wrangler.jsonc'), originalConfig)
    await rm(path.join(root, 'trace.txt'), { force: true })
    assert.throws(() => hosted(overrides), error => {
      if (message) assert.ok(error.stderr.toString().includes(message), error.stderr.toString())
      return true
    })
    assert.ok((await readFile(path.join(root, 'wrangler.jsonc'))).equals(originalConfig), 'A rejected build cannot write configuration')
    assert.equal((await readdir(root)).includes('wrangler.jsonc.verified'), false)
  }
  await rejected({ MASTER_DESIGN_PAGES_PROJECT: 'wrong-project' })
  await rejected({ PAGES_FIXTURE_POINTER: 'f'.repeat(40) }, 'superseded')
  // A commit no validated delivery published never installs anything.
  await writeFile(path.join(root, 'remote.json'), JSON.stringify({ manifest: false }))
  await rejected({}, 'No validated delivery published a manifest')
  assert.equal((await readdir(root)).includes('trace.txt'), false)
  await rm(path.join(root, 'remote.json'))
  await writeFile(path.join(root, 'payload.json'), JSON.stringify({ ...payload, 'assets/a.css': 'a{color:blue}' }))
  await rejected({}, 'Cloudflare output differs')
})

async function deliveryFixture(t, scenario) {
  const root = await mkdtemp(path.join(tmpdir(), 'master-design-pages-deliver-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const name of ['scripts', 'tools', 'site/out', 'release-artifacts']) await mkdir(path.join(root, name), { recursive: true })
  for (const name of ['pages-site-release.mjs', 'pages-site-manifest.mjs', 'pages-release-github.mjs']) {
    await copyFile(new URL(name, scripts), path.join(root, 'scripts', name))
  }
  await writeFile(path.join(root, 'site/out/index.html'), '<p>Exact revision</p>')
  for (const [name, contents] of Object.entries(pagesFiles)) await writeFile(path.join(root, 'site/out', name), contents)
  await prepareIdentity(path.join(root, 'site/out'), metadata)
  const identity = JSON.parse(await readFile(path.join(root, 'site/out/site-release.json'), 'utf8'))
  const data = jsonBytes(await createManifest(path.join(root, 'site/out'), metadata))
  await writeFile(path.join(root, 'release-artifacts/site.manifest.json'), data)
  await writeFixture(root, data)
  await writeFile(path.join(root, 'identity.json'), JSON.stringify(identity))
  await writeFile(path.join(root, 'remote.json'), JSON.stringify({ manifest: scenario === 'manifest-response-lost',
    pointer: scenario === 'create-pointer-response-lost' ? null : 'b'.repeat(40), mutations: [] }))
  await writeFile(path.join(root, 'fetch.mjs'), `
import assert from 'node:assert/strict'
import fs from 'node:fs'
const { metadata: m, tag, commit, blob, tree } = JSON.parse(fs.readFileSync('fixture.json'))
const identity = JSON.parse(fs.readFileSync('identity.json'))
const scenario = process.env.PAGES_FIXTURE_SCENARIO
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers })
const remote = () => JSON.parse(fs.readFileSync('remote.json'))
const mutate = (kind, change) => {
  const attempt = JSON.parse(fs.readFileSync('release-artifacts/site-delivery.json')).attempts.at(-1)
  assert.equal(attempt.status, 'running')
  assert.equal(attempt.writes.at(-1).outcome, 'unknown', 'intent must exist before a mutation')
  assert.equal(attempt.writes.at(-1).operation, kind)
  const state = remote(); Object.assign(state, change); state.mutations.push(kind)
  fs.writeFileSync('remote.json', JSON.stringify(state))
}
const lost = () => { throw new Error('fixture-secret-token PRIVATE_ACCOUNT full-private-deployment-id') }
globalThis.fetch = async (address, options = {}) => {
  address = String(address)
  if (address.startsWith('https://api.github.com/')) assert.equal(options.headers.Authorization, 'Bearer fixture-secret-token')
  else if (address.endsWith('/site-release.json')) {
    assert.equal(options.headers?.Authorization, undefined)
    if (address.startsWith(m.origin) && scenario === 'canonical-failure') lost()
    return json(identity, 200, scenario === 'immutable-failure' ? {} : { 'x-robots-tag': 'noindex' })
  } else throw new Error('Blocked unmocked network request')
  const route = address.replace('https://api.github.com/repos/' + m.repository, '')
  const body = options.body ? JSON.parse(options.body) : undefined
  if (route === '/git/ref/tags/' + tag) return remote().manifest ? json({ ref: 'refs/tags/' + tag, object: { type: 'commit', sha: commit } }) : json({}, 404)
  if (route === '/git/commits/' + commit) return json({ sha: commit, tree: { sha: tree }, parents: [{ sha: m.revision }], committer: { date: new Date(Date.now() - 10000).toISOString() } })
  if (route === '/git/blobs') return json({ sha: blob }, 201)
  if (route === '/git/trees') return json({ sha: tree }, 201)
  if (route === '/git/commits') { assert.deepEqual(body.parents, [m.revision]); return json({ sha: commit }, 201) }
  if (route === '/git/refs' && body.ref === 'refs/tags/' + tag) {
    assert.equal(body.sha, commit); mutate('create-manifest', { manifest: true })
    return json({}, 201)
  }
  if (route === '/git/ref/heads/' + m.deliveryBranch) return remote().pointer ? json({ ref: 'refs/heads/' + m.deliveryBranch, object: { type: 'commit', sha: remote().pointer } }) : json({}, 404)
  if (route === '/git/refs' && options.method === 'POST') {
    assert.deepEqual(body, { ref: 'refs/heads/' + m.deliveryBranch, sha: m.revision })
    mutate('create-pointer', { pointer: m.revision }); lost()
  }
  if (route === '/git/refs/heads/' + m.deliveryBranch && options.method === 'PATCH') {
    assert.deepEqual(body, { sha: m.revision, force: false })
    mutate('advance-pointer', { pointer: m.revision })
    if (scenario === 'pointer-response-lost') lost()
    return json({})
  }
  if (route.includes('/check-runs?')) {
    const id = '12345678-1234-1234-1234-123456789abc'
    return json({ check_runs: [{ id: 42, head_sha: m.revision, app: { slug: 'cloudflare-workers-and-pages' }, name: 'Cloudflare Pages', started_at: new Date().toISOString(), status: 'completed', conclusion: scenario === 'cf-failure' ? 'failure' : 'success', external_id: id, details_url: 'https://dash.cloudflare.com/PRIVATE_ACCOUNT/pages/view/' + m.project + '/' + id }] })
  }
  throw new Error('Blocked unmocked network request')
}
`)
  return { root, async run(nextScenario = scenario, mode = 'bootstrap') {
    const env = { PATH: `${path.join(root, 'tools')}${path.delimiter}${process.env.PATH}`, ...ci, GITHUB_TOKEN: 'fixture-secret-token',
      GITHUB_RUN_ID: '1234', GITHUB_RUN_ATTEMPT: '2', PAGES_RELEASE_MODE: mode, PAGES_FIXTURE_SCENARIO: nextScenario, PAGES_CANONICAL_TIMEOUT_MS: '0',
      NODE_OPTIONS: `--import=${pathToFileURL(path.join(root, 'fetch.mjs')).href}` }
    let output, code = 0
    try { output = execFileSync(process.execPath, ['scripts/pages-site-release.mjs', 'deliver'], { cwd: root, env, encoding: 'utf8', stdio: 'pipe', timeout: 10000 }) }
    catch (error) { code = error.status; output = error.stdout.toString() + error.stderr.toString() }
    const bytes = await readFile(path.join(root, 'release-artifacts/site-delivery.json'), 'utf8')
    for (const secret of ['fixture-secret-token', 'PRIVATE_ACCOUNT', '12345678-1234-1234-1234-123456789abc', 'full-private-deployment-id']) {
      assert.ok(!bytes.includes(secret)); assert.ok(!output.includes(secret))
    }
    return { code, output, receipt: JSON.parse(bytes), remote: JSON.parse(await readFile(path.join(root, 'remote.json'), 'utf8')) }
  } }
}

test('real delivery preserves source-bound failure receipts after acknowledged or uncertain writes', async t => {
  for (const scenario of ['cf-failure', 'pointer-response-lost', 'create-pointer-response-lost', 'immutable-failure', 'canonical-failure']) {
    await t.test(scenario, async child => {
      const fixture = await deliveryFixture(child, scenario)
      const result = await fixture.run(scenario, scenario === 'canonical-failure' ? 'production' : 'bootstrap')
      assert.equal(result.code, 1, result.output)
      const attempt = result.receipt.attempts[0]
      for (const [key, value] of Object.entries(metadata)) assert.deepEqual(attempt[key], value)
      assert.equal(attempt.status, 'failed'); assert.equal(attempt.canonicalVerified, false)
      assert.equal(attempt.immutablePagesVerified, scenario === 'canonical-failure')
      assert.equal(attempt.runId, '1234'); assert.equal(attempt.runAttempt, '2')
      assert.equal(attempt.mode, scenario === 'canonical-failure' ? 'production' : 'bootstrap')
      assert.equal(attempt.events[0].phase, 'intent')
      assert.equal(attempt.failure.code, 'PAGES_DELIVERY_NOT_VERIFIED')
      const uncertain = scenario.endsWith('response-lost')
      assert.equal(attempt.writes.at(-1).outcome, uncertain ? 'unknown' : 'acknowledged')
      assert.deepEqual(attempt.writes[0].operation, 'create-manifest')
      assert.equal(result.remote.pointer, revision); assert.equal(attempt.manifest.verified, true)
      assert.equal(attempt.pointer.verified, !uncertain)
      if (uncertain) {
        const retry = await fixture.run('success')
        assert.equal(retry.code, 0, retry.output); assert.equal(retry.receipt.attempts.length, 2)
        assert.deepEqual(retry.receipt.attempts[0], attempt, 'retry retains the exact previous uncertain attempt')
        assert.equal(retry.receipt.attempts[1].pointer.advanced, false)
        assert.deepEqual(retry.receipt.attempts[1].writes, [], 'retry verifies the manifest and pointer rather than writing them again')
        assert.equal(retry.receipt.attempts[1].immutablePagesVerified, true)
        assert.equal(retry.receipt.attempts[1].canonicalVerified, false)
        assert.deepEqual(retry.remote.mutations, ['create-manifest', scenario.startsWith('create-') ? 'create-pointer' : 'advance-pointer'])
      }
    })
  }
})

test('an existing identical manifest tag is verified, not written again', async t => {
  const fixture = await deliveryFixture(t, 'manifest-response-lost')
  const { code, receipt, remote, output } = await fixture.run('success')
  assert.equal(code, 0, output)
  assert.deepEqual(receipt.attempts[0].writes.map(write => write.operation), ['advance-pointer'])
  assert.deepEqual(remote.mutations, ['advance-pointer'])
})

test('real successful delivery records bootstrap and production checks separately', async t => {
  for (const mode of ['bootstrap', 'production']) {
    const fixture = await deliveryFixture(t, 'success')
    const { code, receipt, output } = await fixture.run('success', mode)
    assert.equal(code, 0, output)
    const attempt = receipt.attempts[0]
    assert.equal(attempt.status, 'success'); assert.equal(attempt.phase, 'complete')
    assert.equal(attempt.mode, mode); assert.equal(attempt.immutablePagesVerified, true)
    assert.equal(attempt.canonicalVerified, mode === 'production')
    assert.equal(attempt.pointer.verified, true); assert.equal(attempt.manifest.verified, true)
    assert.equal(attempt.manifest.tag, manifestTag(metadata))
    assert.equal(attempt.pages.checkRunId, 42)
    assert.equal(attempt.manifestSha256, attempt.manifest.sha256)
    assert.equal(attempt.manifestSha256, sha256(await readFile(path.join(fixture.root, 'release-artifacts/site.manifest.json'))))
  }
})
