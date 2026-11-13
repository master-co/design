import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { advancePointer, completedPagesCheck, fetchManifest, publishManifest, verifyLiveIdentity, waitForLiveIdentity, waitForPages } from '../scripts/pages-release-github.mjs'
import { gitBlobId, identityPath, inventoryDigest, jsonBytes, manifestTag, manifestTreeId, sha256 } from '../scripts/pages-site-manifest.mjs'

const metadata = { repository: 'master-co/design', revision: 'a'.repeat(40), channel: 'main', deliveryBranch: 'pages-stable',
  project: 'fixture', subdomain: 'fixture-suffix.pages.dev', origin: 'https://design.master.co' }
const files = [{ path: '404.html', size: 9, sha256: 'e'.repeat(64) }, { path: '_headers', size: 13, sha256: 'c'.repeat(64) },
  { path: '_redirects', size: 17, sha256: 'd'.repeat(64) }, { path: 'index.html', size: 10, sha256: 'a'.repeat(64) },
  { path: identityPath, size: 20, sha256: 'b'.repeat(64) }]
const manifest = { schemaVersion: 1, ...metadata, files, buildDigest: inventoryDigest(files) }
const token = 'fixture-token', data = jsonBytes(manifest), tag = manifestTag(metadata)
const createdAt = '2026-11-05T00:00:00Z'
const identity = { schemaVersion: 1, ...metadata, payloadDigest: inventoryDigest(files.filter(file => file.path !== identityPath)) }
const json = (value, status = 200) => new Response(JSON.stringify(value), { status })
const otherBytes = () => {
  const changed = files.map(file => file.path === 'index.html' ? { ...file, sha256: 'f'.repeat(64) } : file)
  return jsonBytes({ ...manifest, files: changed, buildDigest: inventoryDigest(changed) })
}

function gitDataApi({ existing, parents = [metadata.revision], race = false, wrongBlob = false } = {}) {
  const commits = new Map(), blobs = new Map()
  let ref
  const store = (bytes, commitParents) => {
    const sha = sha256(Buffer.concat([bytes, Buffer.from(String(commits.size))])).slice(0, 40)
    commits.set(sha, { tree: manifestTreeId(bytes), parents: commitParents })
    return sha
  }
  if (existing) ref = store(existing, parents)
  const calls = []
  const fetchApi = async (url, options = {}) => {
    calls.push({ url, method: options.method ?? 'GET' })
    assert.equal(options.headers.Authorization, `Bearer ${token}`)
    assert.equal(options.redirect, 'error')
    const route = url.replace('https://api.github.com/repos/master-co/design', '')
    if (route === `/git/ref/tags/${tag}`) return ref ? json({ ref: `refs/tags/${tag}`, object: { type: 'commit', sha: ref } }) : json({ message: 'Not Found' }, 404)
    if (route.startsWith('/git/commits/') && !options.method) {
      const commit = commits.get(route.slice('/git/commits/'.length))
      return json({ sha: route.slice('/git/commits/'.length), tree: { sha: commit.tree }, parents: commit.parents.map(sha => ({ sha })), committer: { date: createdAt } })
    }
    const body = JSON.parse(options.body)
    if (route === '/git/blobs') {
      const bytes = Buffer.from(body.content, body.encoding)
      const sha = wrongBlob ? 'f'.repeat(40) : gitBlobId(bytes)
      blobs.set(sha, bytes)
      return json({ sha }, 201)
    }
    if (route === '/git/trees') {
      assert.equal(body.base_tree, undefined, 'The manifest tree holds only the manifest')
      assert.deepEqual(body.tree.map(entry => [entry.path, entry.mode, entry.type]), [['site.manifest.json', '100644', 'blob']])
      return json({ sha: manifestTreeId(blobs.get(body.tree[0].sha)) }, 201)
    }
    if (route === '/git/commits') {
      assert.deepEqual(body.parents, [metadata.revision])
      const bytes = [...blobs.values()].find(value => manifestTreeId(value) === body.tree)
      return json({ sha: store(bytes, body.parents) }, 201)
    }
    if (route === '/git/refs') {
      assert.equal(body.ref, `refs/tags/${tag}`)
      if (race) { ref = store(data, [metadata.revision]); return json({ message: 'Reference already exists' }, 422) }
      ref = body.sha
      return json({ ref: body.ref }, 201)
    }
    throw new Error(`Unexpected request ${options.method} ${route}`)
  }
  return { fetchApi, calls, posts: () => calls.filter(call => call.method === 'POST').map(call => call.url.split('/').pop()) }
}

test('a manifest tag is created once, bound to its revision, and later verified without writing', async () => {
  const server = gitDataApi()
  const writes = []
  const proof = await publishManifest(metadata, data, { token, fetchApi: server.fetchApi, onWrite: write => writes.push(write) })
  assert.deepEqual(server.posts(), ['blobs', 'trees', 'commits', 'refs'])
  assert.deepEqual(writes.map(write => [write.operation, write.stage]), [['create-manifest', 'before'], ['create-manifest', 'after']])
  assert.deepEqual(proof, { tag, commit: proof.commit, tree: manifestTreeId(data), sha256: sha256(data), createdAt })
  await publishManifest(metadata, data, { token, fetchApi: server.fetchApi })
  assert.equal(server.posts().length, 4)
  assert.ok(server.calls.every(call => !['PATCH', 'PUT', 'DELETE'].includes(call.method)))
})

test('an existing manifest with other bytes or another parent is refused without replacing it', async () => {
  for (const server of [gitDataApi({ existing: otherBytes() }), gitDataApi({ existing: data, parents: ['f'.repeat(40)] }),
    gitDataApi({ existing: data, parents: [metadata.revision, 'f'.repeat(40)] })]) {
    await assert.rejects(publishManifest(metadata, data, { token, fetchApi: server.fetchApi }))
    assert.ok(server.calls.every(call => call.method === 'GET'))
  }
})

test('a concurrent create is accepted only when the winning tag holds the same bytes', async () => {
  const server = gitDataApi({ race: true })
  await publishManifest(metadata, data, { token, fetchApi: server.fetchApi })
  assert.equal(server.posts().filter(name => name === 'refs').length, 1)
  await assert.rejects(publishManifest(metadata, data, { token, fetchApi: gitDataApi({ wrongBlob: true }).fetchApi }))
  await assert.rejects(publishManifest(metadata, otherBytes(), { token, fetchApi: gitDataApi({ race: true }).fetchApi }), /never replace/)
})

function publicGit({ listed = `${'c'.repeat(40)}\trefs/tags/${tag}`, type = 'commit', parents = [metadata.revision], bytes = data, entries } = {}) {
  const calls = []
  const blob = gitBlobId(bytes)
  const runGit = args => {
    calls.push(args)
    if (args[0] === 'ls-remote') {
      assert.deepEqual(args, ['ls-remote', 'https://github.com/master-co/design.git', `refs/tags/${tag}`])
      return Buffer.from(listed + '\n')
    }
    if (args[0] === 'fetch') {
      assert.deepEqual(args, ['fetch', '--quiet', '--no-tags', 'https://github.com/master-co/design.git', `refs/tags/${tag}`])
      return Buffer.alloc(0)
    }
    if (args[0] === 'cat-file' && args[1] === '-t') return Buffer.from(type + '\n')
    if (args[0] === 'cat-file' && args[1] === 'commit') {
      return Buffer.from(`tree ${manifestTreeId(data)}\n${parents.map(sha => `parent ${sha}\n`).join('')}author A <a@b> 0 +0000\ncommitter A <a@b> 0 +0000\n\nparent ${'f'.repeat(40)}\n`)
    }
    if (args[0] === 'ls-tree') return Buffer.from((entries ?? `100644 blob ${blob}\tsite.manifest.json`) + '\n')
    if (args[0] === 'cat-file' && args[1] === 'blob') return bytes
    throw new Error(`Unexpected git ${args.join(' ')}`)
  }
  return { runGit, calls }
}

test('the public manifest is read over Git and bound to the revision, its tree and its bytes', () => {
  const server = publicGit()
  const result = fetchManifest(metadata, server.runGit)
  assert.ok(result.bytes.equals(data))
  assert.deepEqual(result.manifest, manifest)
  assert.equal(result.commit, 'c'.repeat(40))
  for (const wrong of [
    { listed: '' }, { listed: `${'c'.repeat(40)}\trefs/tags/${tag}\n${'d'.repeat(40)}\trefs/tags/${tag}^{}` },
    { type: 'tag' }, { parents: [] }, { parents: ['f'.repeat(40)] }, { parents: [metadata.revision, 'f'.repeat(40)] },
    { bytes: otherBytes() }, { entries: `100644 blob ${gitBlobId(data)}\tother.json` },
    { entries: `100644 blob ${gitBlobId(data)}\tsite.manifest.json\n100644 blob ${gitBlobId(data)}\textra.json` }
  ]) assert.throws(() => fetchManifest(metadata, publicGit(wrong).runGit))
  // The commit only parents the revision; the manifest still names the revision itself.
  assert.throws(() => fetchManifest({ ...metadata, project: 'other' }, publicGit().runGit))
})

test('real Git, including a shallow clone, reads the manifest commit exactly as CI publishes it', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'master-design-pages-git-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const origin = path.join(root, 'origin'), clone = path.join(root, 'clone')
  const env = { ...process.env, GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.com', GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.com' }
  const run = (cwd, args, input) => execFileSync('git', args, { cwd, env, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
  run(root, ['init', '--quiet', origin])
  await writeFile(path.join(origin, 'a.txt'), 'a')
  run(origin, ['add', 'a.txt']); run(origin, ['commit', '--quiet', '-m', 'Source'])
  const source = run(origin, ['rev-parse', 'HEAD'])
  const local = { ...metadata, revision: source }
  const filesFor = { ...manifest, revision: source }
  const bytes = jsonBytes(filesFor)
  // The same objects the Git Data API calls create: a blob, a one-entry tree and a commit whose parent is the source.
  const blob = run(origin, ['hash-object', '-w', '--stdin'], bytes)
  const tree = run(origin, ['mktree'], `100644 blob ${blob}\tsite.manifest.json\n`)
  assert.equal(tree, manifestTreeId(bytes))
  const commit = run(origin, ['commit-tree', tree, '-p', source, '-m', `Site output manifest of ${source}`])
  run(origin, ['tag', manifestTag(local), commit])
  run(root, ['clone', '--quiet', '--depth', '1', '--no-tags', `file://${origin}`, clone])
  const remote = 'https://github.com/master-co/design.git'
  const runGit = args => execFileSync('git', args.map(arg => arg === remote ? `file://${origin}` : arg), { cwd: clone, env, stdio: ['ignore', 'pipe', 'ignore'] })
  const result = fetchManifest(local, runGit)
  assert.ok(result.bytes.equals(bytes))
  assert.equal(result.commit, commit)
  // A tag on another revision's manifest commit cannot vouch for this one.
  const other = run(origin, ['commit-tree', tree, '-m', 'Parentless'])
  run(origin, ['tag', '--force', manifestTag(local), other])
  assert.throws(() => fetchManifest(local, runGit), /only its source revision as parent/)
})

function pointerApi({ initial = 'b'.repeat(40), reject = false, concurrent = false } = {}) {
  let current = initial, reads = 0
  const mutations = []
  return { mutations, fetchApi: async (url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${token}`)
    if (!options.method) {
      reads++
      if (!current) return json({}, 404)
      return json({ ref: `refs/heads/${metadata.deliveryBranch}`, object: { type: 'commit', sha: concurrent && reads > 1 ? 'f'.repeat(40) : current } })
    }
    const body = JSON.parse(options.body)
    mutations.push({ url, method: options.method, body })
    if (reject) return json({}, 422)
    current = body.sha
    return json({}, options.method === 'POST' ? 201 : 200)
  } }
}

test('an existing delivery ref advances without force and without creating a commit', async () => {
  const server = pointerApi()
  assert.deepEqual(await advancePointer(metadata, { token, fetchApi: server.fetchApi }), { advanced: true })
  assert.deepEqual(server.mutations.map(call => [call.method, call.body]), [['PATCH', { sha: metadata.revision, force: false }]])
  assert.ok(server.mutations[0].url.endsWith('/git/refs/heads/pages-stable'))
  await assert.rejects(advancePointer({ ...metadata, deliveryBranch: 'main' }, { token, fetchApi: async () => { throw new Error('must not request') } }))
})

test('initial creation and an already-selected source remain distinct from force or synthetic commits', async () => {
  const initial = pointerApi({ initial: null })
  await advancePointer(metadata, { token, fetchApi: initial.fetchApi })
  assert.deepEqual(initial.mutations.map(call => [call.method, call.body]), [['POST', { ref: 'refs/heads/pages-stable', sha: metadata.revision }]])
  const same = pointerApi({ initial: metadata.revision })
  assert.deepEqual(await advancePointer(metadata, { token, fetchApi: same.fetchApi }), { advanced: false })
  assert.equal(same.mutations.length, 0)
  await assert.rejects(advancePointer(metadata, { token, fetchApi: pointerApi({ reject: true }).fetchApi }), /fast-forward/)
  await assert.rejects(advancePointer(metadata, { token, fetchApi: pointerApi({ concurrent: true }).fetchApi }), /concurrently/)
})

const deploymentId = '12345678-1234-1234-1234-123456789abc'
const check = { id: 42, head_sha: metadata.revision, app: { slug: 'cloudflare-workers-and-pages' }, name: `Cloudflare Pages: ${metadata.project}`,
  started_at: createdAt, status: 'completed', conclusion: 'success', external_id: deploymentId,
  details_url: `https://dash.cloudflare.com/?to=/fixture-account/pages/view/${metadata.project}/${deploymentId}` }

test('the watcher identifies the actual Cloudflare App, project route and exact source rather than another same-named check', () => {
  const proof = completedPagesCheck([check], { metadata, startedAt: createdAt })
  assert.equal(proof.deploymentUrl, `https://12345678.${metadata.subdomain}`)
  assert.ok(!JSON.stringify(proof).includes(deploymentId))
  assert.equal(completedPagesCheck([{ ...check, name: 'Cloudflare Pages' }], { metadata, startedAt: createdAt }).checkRunId, 42)
  for (const wrong of [
    { ...check, head_sha: 'f'.repeat(40) }, { ...check, app: { slug: 'github-actions' } },
    { ...check, name: 'Workers Builds: fixture' }, { ...check, name: 'Cloudflare Pages: other-project' }, { ...check, started_at: '2025-01-01T00:00:00Z' },
    { ...check, details_url: check.details_url.replace('/fixture/', '/other-project/') },
    { ...check, details_url: check.details_url.replace('dash.cloudflare.com', 'untrusted.example') }
  ]) assert.equal(completedPagesCheck([wrong], { metadata, startedAt: createdAt }), null)
  assert.equal(completedPagesCheck([{ ...check, status: 'in_progress' }], { metadata, startedAt: createdAt }), null)
  assert.throws(() => completedPagesCheck([{ ...check, conclusion: 'failure' }], { metadata, startedAt: createdAt }))
})

test('all-check selection separates projects and accepts a newer official retry only after it finishes', () => {
  const other = { ...check, id: 100, details_url: check.details_url.replace('/fixture/', '/other-project/') }
  assert.equal(completedPagesCheck([other, check], { metadata, startedAt: createdAt }).checkRunId, 42)
  assert.equal(completedPagesCheck([check, { ...check, id: 43, status: 'in_progress' }], { metadata, startedAt: createdAt }), null)
})

test('an App success is followed by an unauthenticated immutable identity check', async () => {
  const calls = []
  const fetchApi = async (url, options) => {
    calls.push(url)
    if (url.startsWith('https://api.github.com/')) {
      assert.ok(url.includes('filter=all'))
      assert.equal(options.headers.Authorization, `Bearer ${token}`)
      return json({ check_runs: [check] })
    }
    assert.equal(url, `https://12345678.${metadata.subdomain}/${identityPath}`)
    assert.equal(options.headers, undefined)
    return new Response(JSON.stringify(identity), { headers: { 'X-Robots-Tag': 'noindex' } })
  }
  const proof = await waitForPages(metadata, { token, startedAt: createdAt, manifest, fetchApi })
  assert.equal(proof.checkRunId, 42)
  assert.equal(calls.length, 2)
  await verifyLiveIdentity(metadata.origin, metadata, manifest, async () => json(identity))
  await assert.rejects(verifyLiveIdentity(metadata.origin, metadata, manifest, async () => json({ ...identity, revision: 'f'.repeat(40) })))
  await assert.rejects(verifyLiveIdentity(metadata.origin, metadata, manifest, async () => json({}, 404)))
  await assert.rejects(verifyLiveIdentity('https://ui.master.co', metadata, manifest, async () => json(identity)))
})

test('immutable Pages identity requires its real noindex response header while canonical identity does not', async () => {
  const immutable = `https://12345678.${metadata.subdomain}`
  await assert.rejects(verifyLiveIdentity(immutable, metadata, manifest, async () => json(identity), { requireNoindex: true }), /X-Robots-Tag/)
  await assert.rejects(verifyLiveIdentity(immutable, metadata, manifest, async () => new Response(JSON.stringify(identity), {
    headers: { 'X-Robots-Tag': 'noarchive, notnoindex' }
  }), { requireNoindex: true }), /X-Robots-Tag/)
  await verifyLiveIdentity(immutable, metadata, manifest, async () => new Response(JSON.stringify(identity), {
    headers: { 'X-Robots-Tag': 'noarchive, NoINDEX, nofollow' }
  }), { requireNoindex: true })
  await verifyLiveIdentity(metadata.origin, metadata, manifest, async () => json(identity))
})

test('the canonical identity is polled until the custom domain serves the exact build', async () => {
  let calls = 0
  const waits = []
  await waitForLiveIdentity(metadata.origin, metadata, manifest, {
    fetchApi: async () => ++calls < 3 ? json({ ...identity, revision: 'f'.repeat(40) }) : json(identity),
    wait: async ms => { waits.push(ms) }
  })
  assert.equal(calls, 3)
  assert.deepEqual(waits, [15_000, 15_000])
  await assert.rejects(waitForLiveIdentity(metadata.origin, metadata, manifest, {
    fetchApi: async () => json({ ...identity, revision: 'f'.repeat(40) }), wait: async () => {}, timeout: 0
  }), /identity differs/)
})

test('a skipped or missing Pages check cannot turn the aggregate delivery green', async () => {
  await assert.rejects(waitForPages(metadata, { token, startedAt: createdAt, manifest,
    fetchApi: async () => json({ check_runs: [] }), wait: async () => {}, timeout: 2 }), /Timed out/)
})
