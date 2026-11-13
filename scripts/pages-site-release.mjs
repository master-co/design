// Delivers the website through Cloudflare Pages' Git integration, only for a validated revision of main.
// The website has its own lifecycle: every push to main that passes check.yml delivers, independently
// of skill releases. The site documents no version, so a revision is identified by its commit alone.
//
// In the deploy-site workflow, after check.yml validated and browser-tested this exact commit:
//   plan        decides whether this push delivers (only once the Pages repository variables exist)
//   identity    requires the rebuilt site/out to equal the tested output, then writes site-release.json,
//               the public identity of this build
//   manifest    records every final output file
//   deliver     publishes the manifest as the tag site-manifest/main/<commit>, moves pages-stable to
//               this commit and waits for the Pages deployment and, in production mode, for the canonical origin
//   canonical   proves later, from a retained manifest, that the canonical origin serves that build
//
// In Cloudflare Pages, which builds pages-stable (scripts/build-site-hosted.sh):
//   hosted-prepare  requires the manifest CI published for this exact commit
//   hosted-verify   requires the same output, byte for byte, and that pages-stable still points here
import assert from 'node:assert/strict'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertSameOutput, channels, createManifest, jsonBytes, manifestTag, prepareIdentity, releaseMetadata, repository, sha256, validateManifest, verifyOutput } from './pages-site-manifest.mjs'
import { advancePointer, fetchManifest, git, publishManifest, remote, verifyLiveIdentity, waitForLiveIdentity, waitForPages } from './pages-release-github.mjs'

const text = value => String(value).trim()
const manifestOutput = 'release-artifacts/site.manifest.json'

/**
 * Decides whether a push delivers the site. The workflow runs this only after check.yml passed
 * for the exact commit, so every validated push to main delivers. Until the Pages repository
 * variables exist, nothing is delivered.
 */
export function planDelivery({ configured, channel }) {
  if (!configured) {
    return { deliver: false, reason: 'Cloudflare Pages delivery is not configured: set the CLOUDFLARE_PAGES_PROJECT, CLOUDFLARE_PAGES_SUBDOMAIN and CLOUDFLARE_PAGES_MODE repository variables.' }
  }
  assert.ok(Object.hasOwn(channels, channel), 'Only main can deliver the site')
  return { deliver: true }
}

export function ciMetadata(env = process.env, runGit = git) {
  assert.equal(env.GITHUB_REPOSITORY, repository)
  assert.ok(['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME), 'Site delivery belongs to a push or a rerun of main')
  assert.equal(text(runGit(['rev-parse', 'HEAD'])), env.GITHUB_SHA, 'Checkout differs from the site source')
  const channel = env.GITHUB_REF_NAME
  const metadata = releaseMetadata({ repository, revision: env.GITHUB_SHA, channel, deliveryBranch: channels[channel]?.deliveryBranch,
    project: env.PAGES_PROJECT, subdomain: env.PAGES_SUBDOMAIN, origin: env.PUBLIC_URL })
  assert.ok(['bootstrap', 'production'].includes(env.PAGES_RELEASE_MODE), 'Choose an explicit bootstrap or production delivery mode')
  return metadata
}

export function hostedMetadata(env = process.env, runGit = git) {
  assert.equal(env.CF_PAGES, '1', 'This command is exclusively the verified Pages Git build')
  const channel = Object.keys(channels).find(name => channels[name].deliveryBranch === env.CF_PAGES_BRANCH)
  assert.ok(channel, 'Pages must build the delivery branch')
  assert.match(env.CF_PAGES_COMMIT_SHA ?? '', /^[a-f0-9]{40}$/)
  assert.equal(text(runGit(['rev-parse', 'HEAD'])), env.CF_PAGES_COMMIT_SHA, 'Cloudflare source identity differs')
  const metadata = releaseMetadata({ repository, revision: env.CF_PAGES_COMMIT_SHA, channel, deliveryBranch: env.CF_PAGES_BRANCH,
    project: env.MASTER_DESIGN_PAGES_PROJECT, subdomain: env.MASTER_DESIGN_PAGES_SUBDOMAIN, origin: channels[channel].origin })
  if (env.PUBLIC_URL !== undefined) assert.equal(env.PUBLIC_URL, metadata.origin, 'Configured PUBLIC_URL differs from the canonical origin')
  const url = new URL(env.CF_PAGES_URL)
  assert.equal(url.protocol, 'https:')
  assert.ok(!url.username && !url.password && !url.port && url.pathname === '/' && !url.search && !url.hash)
  const prefix = url.hostname.slice(0, -(metadata.subdomain.length + 1))
  assert.equal(url.hostname, `${prefix}.${metadata.subdomain}`, 'Cloudflare is building a different Pages project subdomain')
  assert.match(prefix, /^[a-f0-9]{8}$/, 'An immutable Pages deployment URL is required')
  return metadata
}

// Pages applies Wrangler vars on every deployment, replacing dashboard plaintext values.
// Retain the build inputs in that same source of truth; never copy process.env or masked
// dashboard secret bindings into the configuration.
export function hostedBuildConfig(config, input, { packageManager, nodeVersion = process.versions.node }) {
  const metadata = releaseMetadata(input)
  assert.match(packageManager ?? '', /^bun@\d+\.\d+\.\d+$/, 'The hosted build requires a pinned Bun version')
  assert.match(nodeVersion, /^\d+\.\d+\.\d+$/, 'The actual hosted Node version is required')
  assert.equal(config.pages_build_output_dir, 'site/out', 'Pages must publish the verified output directory')
  assert.equal(config.name, metadata.project, 'wrangler.jsonc must name the Pages project that builds pages-stable')
  const vars = {
    BUN_VERSION: packageManager.slice(4), NODE_VERSION: nodeVersion, SKIP_DEPENDENCY_INSTALL: '1',
    MASTER_DESIGN_PAGES_PROJECT: metadata.project, MASTER_DESIGN_PAGES_SUBDOMAIN: metadata.subdomain
  }
  const result = { ...config, vars: { ...config.vars, ...vars } }
  if (config.env?.production) result.env = { ...config.env,
    production: { ...config.env.production, vars: { ...config.env.production.vars, ...vars } } }
  return result
}

async function writeGitHubFile(name, lines) {
  const file = process.env[name]
  assert.ok(file, `${name} is required`)
  await writeFile(file, lines.map(line => `${line}\n`).join(''), { flag: 'a' })
}

async function plan() {
  const result = planDelivery({
    configured: ['PAGES_PROJECT', 'PAGES_SUBDOMAIN', 'PAGES_RELEASE_MODE'].some(name => process.env[name]),
    channel: process.env.GITHUB_REF_NAME
  })
  await writeGitHubFile('GITHUB_OUTPUT', [`deliver=${result.deliver}`])
  if (!result.deliver) {
    console.log(`::notice title=Site delivery deferred::${result.reason}`)
    return
  }
  // Fail before building when a variable is set but invalid.
  const metadata = ciMetadata()
  console.log(`Delivering ${metadata.revision} to ${metadata.deliveryBranch}.`)
}

async function deliver(metadata) {
  const file = 'release-artifacts/site-delivery.json'
  let receipt = { schemaVersion: 1, attempts: [] }
  try { receipt = JSON.parse(await readFile(file, 'utf8')) } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  assert.equal(receipt.schemaVersion, 1, 'Preserve and reconcile an unfamiliar delivery receipt before retrying')
  assert.ok(Array.isArray(receipt.attempts))
  const attempt = { sequence: receipt.attempts.length + 1, ...metadata, mode: process.env.PAGES_RELEASE_MODE,
    runId: process.env.GITHUB_RUN_ID ?? null, runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    startedAt: new Date().toISOString(), status: 'running', phase: 'intent',
    immutablePagesVerified: false, canonicalVerified: false, writes: [], events: [] }
  receipt.attempts.push(attempt)
  const save = async (phase, values = {}) => {
    Object.assign(attempt, values, { phase, updatedAt: new Date().toISOString() })
    attempt.events.push({ phase, at: attempt.updatedAt })
    await mkdir(path.dirname(file), { recursive: true })
    const temporary = `${file}.${process.pid}.tmp`
    await writeFile(temporary, jsonBytes(receipt))
    await rename(temporary, file)
  }
  const onWrite = async ({ operation, stage, httpStatus }) => {
    assert.ok(['create-manifest', 'advance-pointer', 'create-pointer'].includes(operation))
    if (stage === 'before') attempt.writes.push({ operation, outcome: 'unknown', startedAt: new Date().toISOString() })
    else {
      const write = attempt.writes.at(-1)
      assert.equal(write?.operation, operation)
      Object.assign(write, { httpStatus, respondedAt: new Date().toISOString(),
        outcome: httpStatus >= 200 && httpStatus < 300 ? 'acknowledged'
          : [400, 401, 403, 404, 409, 422].includes(httpStatus) ? 'rejected' : 'unknown' })
    }
    await save(`${operation}-${stage}`)
  }
  await save('intent')
  try {
    await save('verify-input')
    const data = await readFile(manifestOutput)
    const manifest = JSON.parse(data)
    await verifyOutput('site/out', manifest, metadata)
    await save('publish-manifest', { manifestSha256: sha256(data), manifest: { tag: manifestTag(metadata), verified: false } })
    const options = { token: process.env.GITHUB_TOKEN, onWrite }
    const published = await publishManifest(metadata, data, options)
    // Read it back the way the Cloudflare build will, over public Git.
    assert.ok(fetchManifest(metadata).bytes.equals(data), 'The public manifest differs from this delivery')
    await save('advance-pointer', { manifest: { ...published, verified: true },
      pointer: { branch: metadata.deliveryBranch, requestedRevision: metadata.revision, verified: false } })
    const startedAt = new Date().toISOString()
    const pointer = await advancePointer(metadata, options)
    await save('wait-pages', { pointer: { ...attempt.pointer, ...pointer, verified: true, revision: metadata.revision } })
    // Keep the delivery concurrency held until the external build actually deploys.
    const proof = await waitForPages(metadata, { ...options, startedAt: pointer.advanced ? startedAt : published.createdAt, manifest })
    await save('pages-verified', { pages: proof, immutablePagesVerified: true })
    if (attempt.mode === 'production') {
      await save('verify-canonical')
      // Fixtures shorten the window; production waits up to ten minutes for the custom domain.
      const timeout = process.env.PAGES_CANONICAL_TIMEOUT_MS ? Number(process.env.PAGES_CANONICAL_TIMEOUT_MS) : undefined
      await waitForLiveIdentity(metadata.origin, metadata, manifest, { timeout })
      await save('canonical-verified', { canonicalVerified: true })
    }
    await save('complete', { status: 'success' })
    console.log(JSON.stringify(attempt))
  } catch {
    // Never serialize Error messages, response bodies, request headers or token
    // values. Unknown write outcomes stay unknown until a later read proves them.
    const phase = attempt.phase
    await save(phase, { status: 'failed', failure: { phase, code: 'PAGES_DELIVERY_NOT_VERIFIED' } })
    throw new Error(`Pages delivery failed during ${phase}; inspect ${file} before retrying`)
  }
}

async function main(command, argument) {
  if (command === 'canonical') {
    assert.ok(argument, 'The retained site manifest is required')
    const localBytes = await readFile(argument)
    const manifest = JSON.parse(localBytes)
    const metadata = validateManifest(manifest)
    assert.ok(fetchManifest(metadata).bytes.equals(localBytes), 'Retained manifest differs from its published tag')
    await verifyLiveIdentity(metadata.origin, metadata, manifest)
    const proof = { revision: metadata.revision, origin: metadata.origin,
      canonicalVerified: true, manifestSha256: sha256(localBytes), checkedAt: new Date().toISOString() }
    await mkdir('release-artifacts', { recursive: true })
    await writeFile('release-artifacts/site-canonical.json', jsonBytes(proof))
    console.log(JSON.stringify(proof))
    return
  }
  if (command === 'hosted-prepare') {
    assert.ok(argument, 'A temporary evidence directory is required')
    const metadata = hostedMetadata()
    const { bytes } = fetchManifest(metadata)
    await mkdir(argument, { recursive: true })
    await writeFile(path.join(argument, 'manifest.json'), bytes)
    await writeFile(path.join(argument, 'environment'), `PUBLIC_URL=${metadata.origin}\n`)
    console.log(`Prepared ${metadata.revision}; its validated site manifest is published as ${manifestTag(metadata)}.`)
    return
  }
  if (command === 'hosted-verify') {
    assert.ok(argument, 'The temporary evidence directory is required')
    const metadata = hostedMetadata()
    const manifest = JSON.parse(await readFile(path.join(argument, 'manifest.json'), 'utf8'))
    await prepareIdentity('site/out', metadata)
    const proof = await verifyOutput('site/out', manifest, metadata)
    const pointer = text(git(['ls-remote', '--heads', remote, `refs/heads/${metadata.deliveryBranch}`]))
    assert.equal(pointer, `${metadata.revision}\trefs/heads/${metadata.deliveryBranch}`, 'A newer delivery superseded this Pages build')
    // Only after source, complete output inventory and delivery pointer verify.
    // This build-local configuration is outside site/out and the immutable CI manifest.
    const configPath = 'wrangler.jsonc'
    const config = JSON.parse(await readFile(configPath, 'utf8'))
    const { packageManager } = JSON.parse(await readFile('package.json', 'utf8'))
    const next = hostedBuildConfig(config, metadata, { packageManager })
    const temporaryConfig = `${configPath}.verified`
    try {
      await writeFile(temporaryConfig, jsonBytes(next))
      await rename(temporaryConfig, configPath)
    } finally { await rm(temporaryConfig, { force: true }) }
    console.log(JSON.stringify(proof))
    return
  }
  if (command === 'plan') return plan()
  const metadata = ciMetadata()
  if (command === 'identity') {
    assert.ok(argument, 'The output the validation job tested is required')
    const files = await assertSameOutput('site/out', argument)
    await prepareIdentity('site/out', metadata)
    console.log(`The rebuilt site equals the ${files} tested output files; identity written for ${metadata.revision}.`)
  } else if (command === 'manifest') {
    const manifest = await createManifest('site/out', metadata)
    await mkdir(path.dirname(manifestOutput), { recursive: true })
    await writeFile(manifestOutput, jsonBytes(manifest))
    console.log(`Verified ${manifest.files.length} exact output files at ${metadata.revision}.`)
  } else if (command === 'deliver') await deliver(metadata)
  else throw new Error('Expected plan, identity, manifest, deliver, canonical, hosted-prepare or hosted-verify')
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main(process.argv[2], process.argv[3])
}
