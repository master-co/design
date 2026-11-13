import { dev } from 'astro'
import { watch } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify, parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { resolve, sep } from 'node:path'

const site = fileURLToPath(new URL('../', import.meta.url))
const references = resolve(site, '../skills/master-design/references')
const execute = promisify(execFile)
const { values } = parseArgs({ options: {
  port: { type: 'string' }, host: { type: 'string', default: '127.0.0.1' },
} })
const port = values.port === undefined ? undefined : Number(values.port)
if (port !== undefined && (!Number.isInteger(port) || port < 0 || port > 65535)) throw new Error('Invalid --port')

let pending = false, stopping = false
let timer: ReturnType<typeof setTimeout> | undefined
let preparing: Promise<void> | undefined
let server: Awaited<ReturnType<typeof dev>> | undefined

async function prepare() {
  const { stdout } = await execute(process.execPath, ['--import', 'tsx', resolve(site, 'scripts/prepare.ts')], { cwd: site })
  process.stdout.write(stdout)
}

function refresh() {
  pending = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (preparing || stopping) return
    preparing = (async () => {
      while (pending && !stopping) {
        pending = false
        try { await prepare() }
        catch (error) { console.error('[guide] Preparation failed; fix the source and save again.', error) }
      }
    })().finally(() => { preparing = undefined })
  }, 100)
}

// These watchers outlive Vite restarts triggered by generated route adapters.
// Only canonical inputs are watched here; Astro owns component/style HMR.
const watchers = [
  watch(references, { recursive: true }, (_event, file) => { if (file?.endsWith('.md')) refresh() }),
  watch(site, (_event, file) => { if (file === 'catalog.mjs') refresh() }),
  watch(resolve(site, 'figures'), (_event, file) => { if (file === 'catalog.mjs') refresh() }),
  watch(resolve(site, 'scripts'), (_event, file) => {
    if (file && ['prepare.ts', 'content.mjs', 'illustrations.mjs'].includes(file.split(sep).at(-1)!)) refresh()
  }),
]

async function stop() {
  if (stopping) return
  stopping = true
  clearTimeout(timer)
  for (const watcher of watchers) watcher.close()
  await preparing
  await server?.stop()
}
process.once('SIGINT', () => { void stop() })
process.once('SIGTERM', () => { void stop() })

try {
  preparing = prepare()
  await preparing
  preparing = undefined
  server = await dev({ root: site, server: { host: values.host, ...(port === undefined ? {} : { port }) } })
  if (stopping) await server.stop()
  else if (pending) refresh()
} catch (error) {
  preparing = undefined
  await stop()
  throw error
}
