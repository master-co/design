// The identity and output manifest of one delivered website revision. Shared by the delivery in
// GitHub Actions and the Cloudflare Pages build of pages-stable (scripts/pages-site-release.mjs).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const repository = 'master-co/design'
export const identityPath = 'site-release.json'
// The only site channel: validated pushes to main, delivered through pages-stable to the canonical origin.
export const channels = {
  main: { deliveryBranch: 'pages-stable', origin: 'https://design.master.co' }
}
// Pages reads its headers and redirects from the output; a build without them would serve another site.
export const requiredOutput = ['index.html', '404.html', '_headers', '_redirects']
export const manifestFile = 'site.manifest.json'
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
export const jsonBytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const metadataKeys = ['repository', 'revision', 'channel', 'deliveryBranch', 'project', 'subdomain', 'origin']

export function releaseMetadata(input) {
  const result = Object.fromEntries(metadataKeys.map(key => [key, input[key]]))
  assert.equal(result.repository, repository, 'Only the first-party repository is supported')
  assert.match(result.revision ?? '', /^[a-f0-9]{40}$/, 'An exact site source revision is required')
  assert.ok(Object.hasOwn(channels, result.channel), 'Only main can deliver the site')
  assert.equal(result.deliveryBranch, channels[result.channel].deliveryBranch)
  assert.equal(result.origin, channels[result.channel].origin)
  assert.match(result.project ?? '', /^[a-z0-9][a-z0-9-]{0,62}$/, 'A Pages project name is required')
  assert.match(result.subdomain ?? '', /^[a-z0-9][a-z0-9-]{0,62}\.pages\.dev$/, 'Use the actual Pages subdomain, independently of the project name')
  return result
}

/**
 * The tag that holds a revision's manifest. It points at a commit whose only parent is that
 * revision and whose tree holds only `site.manifest.json`, so Git itself binds the bytes to the source.
 */
export function manifestTag(metadata) {
  return `site-manifest/${metadata.channel}/${metadata.revision}`
}

// Git object ids, computed locally so a published manifest can be compared without downloading it.
const gitObjectId = (type, body) => createHash('sha1').update(Buffer.concat([Buffer.from(`${type} ${body.length}\0`), body])).digest('hex')
export const gitBlobId = bytes => gitObjectId('blob', bytes)
export function manifestTreeId(bytes) {
  return gitObjectId('tree', Buffer.concat([Buffer.from(`100644 ${manifestFile}\0`), Buffer.from(gitBlobId(bytes), 'hex')]))
}

export function inventoryDigest(files) {
  return sha256(files.map(file => `${file.path}:${file.sha256}`).join('\n'))
}

function assertFilePath(value) {
  assert.ok(typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes('\0'))
  assert.ok(!path.posix.isAbsolute(value) && !value.split('/').some(part => part === '..' || part === '.' || part === ''))
  assert.equal(path.posix.normalize(value), value, 'Output paths must be canonical relative paths')
}

export async function outputInventory(directory, excluded = new Set()) {
  const files = []
  const visit = async relative => {
    const file = path.join(directory, relative)
    const stat = await lstat(file)
    assert.ok(!stat.isSymbolicLink(), `Output symlinks are forbidden: ${relative}`)
    if (stat.isDirectory()) {
      for (const name of (await readdir(file)).sort()) await visit(relative ? `${relative}/${name}` : name)
    } else {
      assert.ok(stat.isFile(), `Output must contain regular files: ${relative}`)
      assertFilePath(relative)
      if (excluded.has(relative)) return
      assert.ok(stat.size <= 25 * 1024 ** 2, `Pages file exceeds 25 MiB: ${relative}`)
      files.push({ path: relative, size: stat.size, sha256: sha256(await readFile(file)) })
    }
  }
  await visit('')
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
  assert.ok(files.length > 0 && files.length <= 20_000, 'A bounded, nonempty output inventory is required')
  return files
}

function assertRequiredOutput(files) {
  const paths = new Set(files.map(file => file.path))
  for (const file of requiredOutput) assert.ok(paths.has(file), `The site output must contain ${file}`)
}

/**
 * The delivery job rebuilds the commit and requires exactly the bytes the validation job tested
 * in browsers, before anything is published. It is the first proof that the build is reproducible.
 */
export async function assertSameOutput(directory, tested) {
  const [built, expected] = await Promise.all([outputInventory(directory), outputInventory(tested)])
  assertRequiredOutput(expected)
  assert.deepEqual(built, expected, 'The rebuilt site differs from the output the validation job tested')
  return built.length
}

function identityBytes(metadata, payloadDigest) {
  // This descriptor does not contain its own hash or the enclosing manifest hash.
  return jsonBytes({ schemaVersion: 1, ...metadata, payloadDigest })
}

/** Writes the public identity of this delivery into the output; its digest covers every other file. */
export async function prepareIdentity(directory, input) {
  const metadata = releaseMetadata(input)
  const payload = await outputInventory(directory, new Set([identityPath]))
  assertRequiredOutput(payload)
  const target = path.join(directory, identityPath)
  // Inventory rejects a preexisting symlink, including at the reserved path.
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, identityBytes(metadata, inventoryDigest(payload)))
  return metadata
}

export function validateManifest(value, expected) {
  assert.equal(value?.schemaVersion, 1, 'Unsupported site manifest schema')
  const metadata = releaseMetadata(value)
  if (expected) assert.deepEqual(metadata, releaseMetadata(expected), 'Site manifest identity differs')
  assert.deepEqual(Object.keys(value).sort(), ['schemaVersion', ...metadataKeys, 'files', 'buildDigest'].sort())
  assert.ok(Array.isArray(value.files) && value.files.length > 0 && value.files.length <= 20_000)
  for (const file of value.files) {
    assert.deepEqual(Object.keys(file).sort(), ['path', 'sha256', 'size'])
    assertFilePath(file.path)
    assert.ok(Number.isSafeInteger(file.size) && file.size >= 0 && file.size <= 25 * 1024 ** 2)
    assert.match(file.sha256 ?? '', /^[a-f0-9]{64}$/)
  }
  const paths = value.files.map(file => file.path)
  assert.deepEqual(paths, [...new Set(paths)].sort(), 'Manifest paths must be unique and sorted')
  assert.ok(paths.includes(identityPath), 'The manifest must cover the public identity')
  assertRequiredOutput(value.files)
  assert.equal(value.buildDigest, inventoryDigest(value.files), 'Manifest output digest differs')
  return metadata
}

/** Compares a build with the manifest: every file, its bytes and the public identity. */
export async function verifyOutput(directory, manifest, expected) {
  const metadata = validateManifest(manifest, expected)
  const files = await outputInventory(directory)
  assert.deepEqual(files, manifest.files, 'Cloudflare output differs from the verified site output')
  const payload = files.filter(file => file.path !== identityPath)
  assert.ok((await readFile(path.join(directory, identityPath))).equals(identityBytes(metadata, inventoryDigest(payload))), 'Public site identity differs')
  return { revision: metadata.revision, files: files.length, buildDigest: inventoryDigest(files) }
}

/** The manifest of a verified build: its identity and every final output file. */
export async function createManifest(directory, input) {
  const metadata = releaseMetadata(input)
  const files = await outputInventory(directory)
  const payload = files.filter(file => file.path !== identityPath)
  assert.ok((await readFile(path.join(directory, identityPath))).equals(identityBytes(metadata, inventoryDigest(payload))),
    'Public site identity differs from this delivery; write it before verifying the output')
  const manifest = { schemaVersion: 1, ...metadata, files, buildDigest: inventoryDigest(files) }
  await verifyOutput(directory, manifest, metadata)
  return manifest
}
