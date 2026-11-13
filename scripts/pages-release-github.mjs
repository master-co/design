// GitHub side of the website delivery: the manifest tag, the pages-stable pointer and the wait for
// the Cloudflare Pages Git build, all with the workflow's own GITHUB_TOKEN and public reads.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { gitBlobId, identityPath, inventoryDigest, manifestFile, manifestTag, manifestTreeId, releaseMetadata, repository, sha256, validateManifest } from './pages-site-manifest.mjs'

const api = `https://api.github.com/repos/${repository}`
export const remote = `https://github.com/${repository}.git`
const maximumBytes = 32 * 1024 ** 2

export const git = args => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 60_000, maxBuffer: maximumBytes })

async function bytes(response) {
  let size = 0
  const chunks = []
  for await (const chunk of response.body ?? []) {
    size += chunk.length
    assert.ok(size <= maximumBytes, 'Delivery evidence exceeds its download bound')
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Reads a revision's published manifest over public Git, the way the Cloudflare build does: the
 * lightweight tag must point at a commit whose only parent is the revision and whose tree holds
 * only the manifest. Git verifies every object id, so the bytes are exactly the ones CI published.
 */
export function fetchManifest(metadata, runGit = git) {
  releaseMetadata(metadata)
  const tag = manifestTag(metadata)
  const text = args => String(runGit(args)).trim()
  const listed = text(['ls-remote', remote, `refs/tags/${tag}`])
  const match = listed.match(/^([a-f0-9]{40})\trefs\/tags\/(\S+)$/)
  assert.ok(match && match[2] === tag, 'No validated delivery published a manifest for this commit')
  const commit = match[1]
  runGit(['fetch', '--quiet', '--no-tags', remote, `refs/tags/${tag}`])
  assert.equal(text(['cat-file', '-t', commit]), 'commit', 'The manifest tag must point at its manifest commit')
  // Read the raw object: a shallow clone grafts parents away, but never edits the commit itself.
  const raw = text(['cat-file', 'commit', commit])
  const header = raw.slice(0, raw.indexOf('\n\n'))
  assert.deepEqual([...header.matchAll(/^parent ([a-f0-9]{40})$/gm)].map(found => found[1]), [metadata.revision],
    'The manifest commit must have only its source revision as parent')
  const tree = header.match(/^tree ([a-f0-9]{40})$/m)?.[1]
  const entry = text(['ls-tree', commit]).match(/^100644 blob ([a-f0-9]{40})\t(.+)$/)
  assert.ok(entry && entry[2] === manifestFile, `The manifest commit must hold only ${manifestFile}`)
  const data = Buffer.from(runGit(['cat-file', 'blob', entry[1]]))
  assert.equal(gitBlobId(data), entry[1])
  assert.equal(manifestTreeId(data), tree, `The manifest commit must hold only ${manifestFile}`)
  const manifest = JSON.parse(data)
  validateManifest(manifest, metadata)
  return { bytes: data, manifest, commit }
}

function apiClient(token, fetchApi) {
  assert.ok(token, 'The workflow repository token is required')
  return async (route, options = {}) => {
    const url = api + route
    const response = await fetchApi(url, { ...options, headers: {
      Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      ...options.body ? { 'Content-Type': 'application/json' } : {}, ...options.headers
    }, redirect: 'error', signal: AbortSignal.timeout(30_000) })
    return { status: response.status, value: JSON.parse((await bytes(response)).toString() || '{}') }
  }
}

async function writeRequest(request, route, options, operation, onWrite) {
  // Persist the intent before sending anything. A lost response must remain
  // unknown even if the server actually applied the requested mutation.
  await onWrite?.({ operation, stage: 'before' })
  const response = await request(route, options)
  await onWrite?.({ operation, stage: 'after', httpStatus: response.status })
  return response
}

const post = value => ({ method: 'POST', body: JSON.stringify(value) })

/**
 * Publishes the manifest once, as the tag `site-manifest/main/<revision>`. An existing tag must
 * hold exactly the same bytes, compared by Git tree id; it is never moved, replaced or deleted.
 */
export async function publishManifest(metadata, data, { token, fetchApi = fetch, onWrite } = {}) {
  validateManifest(JSON.parse(data), metadata)
  const request = apiClient(token, fetchApi)
  const tag = manifestTag(metadata)
  const tree = manifestTreeId(data)
  const read = async () => {
    const ref = await request(`/git/ref/tags/${tag}`)
    if (ref.status === 404) return undefined
    assert.equal(ref.status, 200, 'Cannot read the site manifest tag')
    assert.equal(ref.value.ref, `refs/tags/${tag}`)
    assert.equal(ref.value.object?.type, 'commit', 'The site manifest tag must point at its manifest commit')
    const commit = await request(`/git/commits/${ref.value.object.sha}`)
    assert.equal(commit.status, 200, 'Cannot read the site manifest commit')
    assert.equal(commit.value.sha, ref.value.object.sha)
    assert.equal(commit.value.tree?.sha, tree, 'The published site manifest differs; never replace a manifest')
    assert.deepEqual(commit.value.parents?.map(parent => parent.sha), [metadata.revision], 'The site manifest commit must have only its source revision as parent')
    assert.ok(Number.isFinite(Date.parse(commit.value.committer?.date)), 'Published manifest creation time is required')
    return { tag, commit: commit.value.sha, tree, sha256: sha256(data), createdAt: commit.value.committer.date }
  }
  const existing = await read()
  if (existing) return existing
  // Unreferenced objects change nothing; only the tag publishes them.
  const blob = await request('/git/blobs', post({ content: data.toString('base64'), encoding: 'base64' }))
  assert.equal(blob.status, 201, 'Cannot store the site manifest')
  assert.equal(blob.value.sha, gitBlobId(data))
  const created = await request('/git/trees', post({ tree: [{ path: manifestFile, mode: '100644', type: 'blob', sha: blob.value.sha }] }))
  assert.equal(created.status, 201, 'Cannot store the site manifest tree')
  assert.equal(created.value.sha, tree)
  const commit = await request('/git/commits', post({ message: `Site output manifest of ${metadata.revision}\n`, tree, parents: [metadata.revision] }))
  assert.equal(commit.status, 201, 'Cannot store the site manifest commit')
  assert.match(commit.value.sha ?? '', /^[a-f0-9]{40}$/)
  const result = await writeRequest(request, '/git/refs', post({ ref: `refs/tags/${tag}`, sha: commit.value.sha }), 'create-manifest', onWrite)
  // A concurrent create may win. Re-read and compare; never replace or delete it.
  assert.ok([201, 422].includes(result.status), `Site manifest tag creation failed (HTTP ${result.status})`)
  const published = await read()
  assert.ok(published, 'Require exactly one published site manifest')
  return published
}

/** GitHub's ref update API without force is fast-forward-only; no commit is made. */
export async function advancePointer(metadata, { token, fetchApi = fetch, onWrite } = {}) {
  releaseMetadata(metadata)
  const request = apiClient(token, fetchApi)
  const ref = `heads/${metadata.deliveryBranch}`
  const current = await request(`/git/ref/${ref}`)
  assert.ok([200, 404].includes(current.status), 'Cannot read the current Pages delivery ref')
  if (current.status === 200) {
    assert.equal(current.value.ref, `refs/${ref}`)
    assert.equal(current.value.object?.type, 'commit')
    if (current.value.object.sha === metadata.revision) return { advanced: false }
    const result = await writeRequest(request, `/git/refs/${ref}`, { method: 'PATCH', body: JSON.stringify({ sha: metadata.revision, force: false }) }, 'advance-pointer', onWrite)
    assert.equal(result.status, 200, 'Pages delivery ref must advance fast-forward; reconcile divergence without force')
  } else {
    const result = await writeRequest(request, '/git/refs', post({ ref: `refs/${ref}`, sha: metadata.revision }), 'create-pointer', onWrite)
    assert.equal(result.status, 201, 'Cannot create the initial Pages delivery ref')
  }
  const final = await request(`/git/ref/${ref}`)
  assert.equal(final.status, 200)
  assert.equal(final.value.object?.sha, metadata.revision, 'Pages delivery ref changed concurrently')
  return { advanced: true }
}

export function completedPagesCheck(checks, { metadata, startedAt }) {
  const found = checks.filter(check => check.head_sha === metadata.revision
    && check.app?.slug === 'cloudflare-workers-and-pages'
    // Cloudflare renamed the check from `Cloudflare Pages` to `Cloudflare Pages: <project>`.
    && [`Cloudflare Pages`, `Cloudflare Pages: ${metadata.project}`].includes(check.name)
    && Date.parse(check.started_at ?? check.created_at) >= Date.parse(startedAt) - 1000)
  // The App uses one check name across projects. Identify the project from its
  // dashboard route, including Cloudflare's observed ?to=/... route form.
  const matching = found.filter(check => {
    let url
    try { url = new URL(check.details_url) } catch { return false }
    if (url.protocol !== 'https:' || url.hostname !== 'dash.cloudflare.com') return false
    const route = url.searchParams.get('to') ?? url.pathname
    return route.endsWith(`/pages/view/${metadata.project}/${check.external_id}`)
  }).sort((a, b) => b.id - a.id)
  if (!matching.length || matching[0].status !== 'completed') return null
  assert.equal(matching[0].conclusion, 'success', 'Cloudflare Pages did not successfully deploy the verified site')
  assert.ok(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(matching[0].external_id ?? ''), 'Pages check has an invalid deployment identity')
  return { checkRunId: matching[0].id, revision: metadata.revision, conclusion: 'success',
    deploymentUrl: `https://${matching[0].external_id.slice(0, 8)}.${metadata.subdomain}` }
}

export async function verifyLiveIdentity(origin, metadata, manifest, fetchApi = fetch, { requireNoindex = false } = {}) {
  validateManifest(manifest, metadata)
  const url = new URL(origin)
  assert.equal(url.protocol, 'https:')
  assert.ok(!url.username && !url.password && !url.port && url.pathname === '/' && !url.search && !url.hash)
  assert.ok(url.origin === metadata.origin || new RegExp(`^https://[a-f0-9]{8}\\.${metadata.subdomain.replaceAll('.', '\\.')}$`).test(url.origin))
  const response = await fetchApi(`${url.origin}/${identityPath}`, { redirect: 'error', signal: AbortSignal.timeout(30_000) })
  assert.equal(response.status, 200, 'The public site must expose its delivery identity')
  if (requireNoindex) assert.ok((response.headers.get('x-robots-tag') ?? '').toLowerCase().split(/[\s,]+/).includes('noindex'), 'The immutable Pages host must return X-Robots-Tag: noindex')
  assert.deepEqual(JSON.parse(await bytes(response)), { schemaVersion: 1, ...metadata,
    payloadDigest: inventoryDigest(manifest.files.filter(file => file.path !== identityPath)) }, 'The deployed Pages identity differs')
}

/**
 * The custom domain can keep serving the previous build for a short while after Cloudflare
 * reports the exact deployment, so the canonical identity is polled within a bounded window.
 * Only the exact identity passes; the last mismatch is rethrown when the window closes.
 */
export async function waitForLiveIdentity(origin, metadata, manifest, { fetchApi = fetch, wait = delay, timeout = 10 * 60_000, interval = 15_000 } = {}) {
  const deadline = performance.now() + timeout
  for (;;) {
    try {
      return await verifyLiveIdentity(origin, metadata, manifest, fetchApi)
    } catch (error) {
      if (performance.now() >= deadline) throw error
    }
    await wait(Math.min(interval, Math.max(0, deadline - performance.now())))
  }
}

export async function waitForPages(metadata, { token, startedAt, manifest, fetchApi = fetch, wait = delay, timeout = 45 * 60_000 } = {}) {
  validateManifest(manifest, metadata)
  assert.ok(Number.isFinite(Date.parse(startedAt)), 'Delivery start time is required')
  const request = apiClient(token, fetchApi)
  const deadline = performance.now() + timeout
  while (performance.now() < deadline) {
    const checks = []
    for (let page = 1; page <= 10; page++) {
      const result = await request(`/commits/${metadata.revision}/check-runs?per_page=100&page=${page}&filter=all`)
      assert.equal(result.status, 200)
      assert.ok(Array.isArray(result.value.check_runs))
      checks.push(...result.value.check_runs)
      if (result.value.check_runs.length < 100) break
      assert.ok(page < 10, 'Too many checks to identify the Pages deployment')
    }
    const proof = completedPagesCheck(checks, { metadata, startedAt })
    if (proof) {
      await verifyLiveIdentity(proof.deploymentUrl, metadata, manifest, fetchApi, { requireNoindex: true })
      return proof
    }
    await wait(Math.min(15_000, Math.max(0, deadline - performance.now())))
  }
  throw new Error('Timed out waiting for the exact Pages Git deployment; a skipped/missing check is not success')
}
