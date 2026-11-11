import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** First-party site dependencies must resolve to the exact registry versions being reviewed. */
export function verifySitePins(dependencies, installed) {
  const pins = Object.entries(dependencies).filter(([name]) => name.startsWith('@master/'))
  assert(pins.some(([name]) => name === '@master/internal-site'), 'Missing shared site dependency')
  assert(pins.some(([name]) => name === '@master/ui'), 'Missing UI dependency')
  for (const [name, expected] of pins) {
    assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(expected), `${name} must use an exact registry version, received ${expected}`)
    assert.equal(installed[name], expected, `${name}: installed package differs from the reviewed pin`)
  }
  return Object.fromEntries(pins)
}

export async function checkSitePins(site = fileURLToPath(new URL('../site/', import.meta.url))) {
  const manifest = JSON.parse(await readFile(join(site, 'package.json'), 'utf8'))
  const require = createRequire(pathToFileURL(join(site, 'package.json')))
  const installed = {}
  for (const name of Object.keys(manifest.dependencies).filter(name => name.startsWith('@master/'))) {
    // Read package metadata through Node's dependency search paths; several CSS packages intentionally
    // do not export package.json. This also supports hoisted and Bun-isolated workspace installs.
    for (const directory of require.resolve.paths(name) ?? []) {
      const metadata = await readFile(join(directory, name, 'package.json'), 'utf8').catch(() => undefined)
      if (!metadata) continue
      const pkg = JSON.parse(metadata)
      if (pkg.name === name) { installed[name] = pkg.version; break }
    }
  }
  return verifySitePins(manifest.dependencies, installed)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify({ verified: true, dependencies: await checkSitePins() }, null, 2))
}
