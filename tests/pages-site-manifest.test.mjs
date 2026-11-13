import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { assertSameOutput, createManifest, gitBlobId, identityPath, inventoryDigest, jsonBytes, manifestTag, manifestTreeId, prepareIdentity, releaseMetadata, validateManifest, verifyOutput } from '../scripts/pages-site-manifest.mjs'

const metadata = { repository: 'master-co/design', revision: 'a'.repeat(40), channel: 'main', deliveryBranch: 'pages-stable',
  project: 'fixture', subdomain: 'fixture-suffix.pages.dev', origin: 'https://design.master.co' }

async function fixture(t) {
  const out = await mkdtemp(path.join(tmpdir(), 'master-design-pages-manifest-'))
  t.after(() => rm(out, { recursive: true, force: true }))
  await mkdir(path.join(out, 'assets'))
  await writeFile(path.join(out, 'index.html'), '<!doctype html><p>Delivery fixture</p>')
  await writeFile(path.join(out, '404.html'), '<!doctype html><p>Not found</p>')
  await writeFile(path.join(out, 'assets/a.css'), 'a{color:red}')
  await writeFile(path.join(out, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n')
  await writeFile(path.join(out, '_redirects'), '/old /new 301\n')
  await prepareIdentity(out, metadata)
  const manifest = await createManifest(out, metadata)
  return { out, manifest }
}

test('the external manifest covers every final file, including a non-recursive public identity', async t => {
  const { out, manifest } = await fixture(t)
  assert.equal(manifest.files.length, 6)
  assert.ok(manifest.files.some(file => file.path === identityPath))
  const identity = JSON.parse(await readFile(path.join(out, identityPath)))
  assert.equal(identity.payloadDigest, inventoryDigest(manifest.files.filter(file => file.path !== identityPath)))
  assert.equal(identity.revision, metadata.revision)
  assert.ok(!('manifestSha256' in identity) && !('accountId' in identity) && !('mode' in identity))
  assert.deepEqual(await verifyOutput(out, manifest, metadata), { revision: metadata.revision, files: 6, buildDigest: manifest.buildDigest })
})

test('same source and bytes reproduce independently of checkout/output paths', async t => {
  const first = await fixture(t), second = await fixture(t)
  assert.notEqual(first.out, second.out)
  assert.deepEqual(first.manifest, second.manifest)
  await prepareIdentity(first.out, metadata)
  await verifyOutput(first.out, first.manifest, metadata)
})

for (const mutation of ['content', 'missing', 'renamed', 'extra-hidden', 'identity', 'symlink']) {
  test(`an output change (${mutation}) cannot reuse the verified manifest`, async t => {
    const { out, manifest } = await fixture(t)
    const css = path.join(out, 'assets/a.css')
    if (mutation === 'content') await writeFile(css, 'a{color:blue}')
    if (mutation === 'missing') await rm(css)
    if (mutation === 'renamed') await rename(css, path.join(out, 'assets/b.css'))
    if (mutation === 'extra-hidden') await writeFile(path.join(out, '.unexpected'), 'unexpected')
    if (mutation === 'identity') await writeFile(path.join(out, identityPath), '{}')
    if (mutation === 'symlink') await symlink('index.html', path.join(out, 'linked.html'))
    await assert.rejects(verifyOutput(out, manifest, metadata))
  })
}

test('the delivery rebuild must equal the tested output before an identity exists', async t => {
  const { out } = await fixture(t)
  await rm(path.join(out, identityPath))
  const tested = `${out}-tested`
  t.after(() => rm(tested, { recursive: true, force: true }))
  await cp(out, tested, { recursive: true })
  assert.equal(await assertSameOutput(out, tested), 5)
  await writeFile(path.join(out, 'assets/a.css'), 'a{color:blue}')
  await assert.rejects(assertSameOutput(out, tested), /differs from the output the validation job tested/)
  await writeFile(path.join(out, 'assets/a.css'), 'a{color:red}')
  await writeFile(path.join(out, '.hidden'), 'dropped by an artifact upload')
  await assert.rejects(assertSameOutput(out, tested), /tested/)
})

test('a manifest requires the identity of this exact delivery to be written first', async t => {
  const { out } = await fixture(t)
  // Another revision, project or subdomain writes another identity, so the same bytes cannot be reused.
  for (const other of [{ ...metadata, project: 'other' }, { ...metadata, subdomain: 'other.pages.dev' }, { ...metadata, revision: 'c'.repeat(40) }]) {
    await assert.rejects(createManifest(out, other), /identity/)
  }
  await writeFile(path.join(out, 'assets/a.css'), 'a{color:blue}')
  await assert.rejects(createManifest(out, metadata), /identity/)
})

test('Pages headers, redirects and the 404 page must be part of every delivered build', async t => {
  for (const file of ['_headers', '_redirects', '404.html', 'index.html']) {
    const { out } = await fixture(t)
    await rm(path.join(out, file))
    await assert.rejects(prepareIdentity(out, metadata), new RegExp(file.replace('.', '\\.')))
  }
})

test('manifest identity and exact path inventory fail closed', async t => {
  const { manifest } = await fixture(t)
  for (const mutate of [
    m => { m.revision = 'b'.repeat(40) }, m => { m.project = 'another-project' },
    m => { m.deliveryBranch = 'main' }, m => { m.origin = 'https://ui.master.co' },
    m => { m.files[0].path = '../escape' }, m => { m.files[0].path = '/absolute' },
    m => { m.files[0].path = 'assets\\escape' }, m => { m.files.push(m.files[0]) },
    m => { m.files.pop() }, m => { m.buildDigest = 'f'.repeat(64) },
    m => { m.files = m.files.filter(file => file.path !== '_headers'); m.buildDigest = inventoryDigest(m.files) },
    m => { m.extra = true }, m => { m.schemaVersion = 2 }
  ]) {
    const wrong = structuredClone(manifest); mutate(wrong)
    assert.throws(() => validateManifest(wrong, metadata))
  }
})

test('the channel, delivery ref and manifest tag are bound to the first-party repository', () => {
  assert.equal(releaseMetadata(metadata).deliveryBranch, 'pages-stable')
  assert.equal(manifestTag(metadata), `site-manifest/main/${metadata.revision}`)
  assert.throws(() => releaseMetadata({ ...metadata, channel: 'next' }), /Only main/)
  assert.throws(() => releaseMetadata({ ...metadata, revision: 'a'.repeat(39) }), /revision/)
  assert.throws(() => releaseMetadata({ ...metadata, deliveryBranch: 'main' }))
  assert.throws(() => releaseMetadata({ ...metadata, origin: 'https://fixture.pages.dev' }))
  assert.throws(() => releaseMetadata({ ...metadata, subdomain: 'https://fixture.pages.dev/' }))
  assert.throws(() => releaseMetadata({ ...metadata, repository: 'fork/design' }))
})

test('local Git object ids equal the ones Git computes for the manifest commit tree', async t => {
  const { manifest } = await fixture(t)
  const data = jsonBytes(manifest)
  const repo = await mkdtemp(path.join(tmpdir(), 'master-design-pages-git-'))
  t.after(() => rm(repo, { recursive: true, force: true }))
  const git = (args, input) => execFileSync('git', args, { cwd: repo, input, encoding: 'utf8' }).trim()
  git(['init', '--quiet'])
  const blob = git(['hash-object', '-w', '--stdin'], data)
  assert.equal(gitBlobId(data), blob)
  assert.equal(manifestTreeId(data), git(['mktree'], `100644 blob ${blob}\tsite.manifest.json\n`))
  assert.notEqual(manifestTreeId(Buffer.concat([data, Buffer.from(' ')])), manifestTreeId(data))
})
