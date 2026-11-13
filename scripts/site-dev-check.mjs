import assert from 'node:assert/strict'
import { appendFileSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile, readdir, symlink, rm } from 'node:fs/promises'
import { resolve, join, relative, sep } from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium, webkit, expect } from '@playwright/test'
import { pages } from '../site/catalog.mjs'

const root = resolve(import.meta.dirname, '..')
const directory = resolve(root, 'artifacts/site-dev')
const fixture = resolve(directory, 'fixture')
await rm(fixture, { recursive: true, force: true })
await mkdir(fixture, { recursive: true })
await cp(resolve(root, 'assets'), resolve(fixture, 'assets'), { recursive: true })
await cp(resolve(root, 'skills/master-design'), resolve(fixture, 'skills/master-design'), { recursive: true })
await cp(resolve(root, 'site'), resolve(fixture, 'site'), { recursive: true, filter: path => {
  const parts = relative(resolve(root, 'site'), path).split(sep)
  return !parts.some(part => ['node_modules', 'out', '.astro', '.categories', 'content', '.wrangler'].includes(part))
} })
await writeFile(resolve(fixture, 'package.json'), '{"private":true,"type":"module"}\n')
await symlink(resolve(root, 'node_modules'), resolve(fixture, 'node_modules'), 'dir')
// Package links are shared; Vite's cache stays inside the isolated fixture.
const modules = resolve(fixture, 'site/node_modules')
await mkdir(modules)
for (const entry of await readdir(resolve(root, 'site/node_modules'))) {
  if (!entry.startsWith('.')) await symlink(resolve(root, 'site/node_modules', entry), join(modules, entry))
}

await writeFile(resolve(directory, 'server.log'), '')
const clientLogs = []
let child, origin, logs = ''
const checks = [], browsers = [], views = []
async function start() {
  child = spawn(process.execPath, ['--import', 'tsx', 'scripts/dev.ts', '--port', '0'], {
    cwd: resolve(fixture, 'site'), env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((ready, reject) => {
    const timeout = setTimeout(() => reject(new Error('Dev startup timed out\n' + logs.slice(-4000))), 60000)
    const collect = chunk => {
      const text = chunk.toString(); logs += text; appendFileSync(resolve(directory, 'server.log'), text)
      const match = text.match(/Local\s+http:\/\/127\.0\.0\.1:(\d+)/)
      if (match) { origin = `http://127.0.0.1:${match[1]}`; clearTimeout(timeout); ready() }
    }
    child.stdout.on('data', collect); child.stderr.on('data', collect)
    child.once('error', error => { clearTimeout(timeout); reject(error) })
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Dev exited: ${code}\n${logs.slice(-4000)}`)) })
  })
  // No retries: the very first cold request is the regression boundary.
  assert.equal((await fetch(origin + '/')).status, 200, 'First cold route succeeds')
}
async function stop() {
  if (!child || child.exitCode !== null) return
  const exited = once(child, 'exit')
  child.kill('SIGTERM')
  const timeout = setTimeout(() => child.kill('SIGKILL'), 15000)
  try { await exited } finally { clearTimeout(timeout) }
}
async function visible(text) {
  await Promise.all(views.map(page => expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 45000 })))
}
async function edit(path, transform, verify) {
  const file = resolve(fixture, path), original = await readFile(file, 'utf8')
  try { await writeFile(file, transform(original)); await verify() }
  finally { await writeFile(file, original) }
}

try {
  await start()
  for (const page of pages) assert.equal((await fetch(origin + page.route)).status, 200, page.route)
  checks.push('Fresh Vite cache: first request and all 51 canonical routes return 200')
  for (const launcher of [chromium, webkit]) {
    const browser = await launcher.launch(); browsers.push(browser)
    const page = await browser.newPage(); views.push(page)
    page.on('console', message => clientLogs.push(`${browser.browserType().name()}: ${message.type()}: ${message.text()}`))
    page.on('pageerror', error => clientLogs.push(`${browser.browserType().name()}: ${error.message}`))
    await page.goto(origin + '/foundations/spacing')
    await expect(page.locator('[data-figure="spacing-groups"]')).toBeVisible()
  }
  const reference = 'skills/master-design/references/foundations/spacing.md'
  await edit(reference, source => source + '\nLive canonical source check.\n', async () => {
    await visible('Live canonical source check.')
    await expect.poll(async () => (await (await fetch(origin + '/guidelines/foundations/spacing.md')).text()).includes('Live canonical source check.')).toBe(true)
    await expect.poll(async () => (await (await fetch(origin + '/search/en.json')).text()).includes('Live canonical source check.')).toBe(true)
    const original = await readFile(resolve(fixture, reference), 'utf8')
    await writeFile(resolve(fixture, reference), original.replace('Live canonical source check.', 'Intermediate edit.'))
    await writeFile(resolve(fixture, reference), original.replace('Live canonical source check.', 'Latest rapid edit.'))
    await visible('Latest rapid edit.')
  })
  for (const page of views) await expect(page.getByText('Latest rapid edit.', { exact: true })).toHaveCount(0)
  checks.push('Canonical Markdown updates open Chromium/WebKit pages, search and downloads; rapid saves retain the latest edit')
  await edit('site/figures/catalog.mjs', source => source.replace('Space identifies which information belongs together', 'Live figure registry title'), async () => { await visible('Live figure registry title') })
  await visible('Space identifies which information belongs together')
  const beforeInvalidSource = logs.length
  await edit('site/figures/catalog.mjs', source => source.replace('Read the grouping before the numbers', 'Missing section for recovery check'), async () => {
    await expect.poll(() => logs.slice(beforeInvalidSource).includes('[guide] Preparation failed'), { timeout: 30000 }).toBe(true)
    assert.equal(child.exitCode, null, 'A source error does not stop the watcher')
  })
  await expect.poll(() => logs.slice(beforeInvalidSource).lastIndexOf('Prepared 51 pages') > logs.slice(beforeInvalidSource).indexOf('[guide] Preparation failed'), { timeout: 30000 }).toBe(true)
  checks.push('Invalid figure placement is reported; correcting the source resumes generation without restarting the launcher')
  await edit('site/components/GuideFigure.astro', source => source.replace("'Equal gaps'", "'Equal gaps live'"), async () => { await visible('Equal gaps live') })
  await visible('Equal gaps')
  checks.push('Figure registry and Astro drawing edits update both open browsers without manual reload')
  await edit('site/styles/figures.css', source => source + '\n.df-label { letter-spacing: .123px; }\n', async () => {
    for (const page of views) await expect.poll(() => page.locator('.df-label').first().evaluate(node => getComputedStyle(node).letterSpacing), { timeout: 30000 }).toBe('0.123px')
  })
  for (const page of views) {
    await expect.poll(() => page.locator('.df-label').first().evaluate(node => getComputedStyle(node).letterSpacing), { timeout: 30000 }).not.toBe('0.123px')
    await page.waitForLoadState('networkidle')
    await page.goto(origin + '/foundations/color')
    await page.locator('[data-lab="color"]').getByRole('slider').fill('0')
  }
  await edit('site/components/DesignLab.svelte', source => source.replace('Reset experiment', 'Reset live experiment'), async () => {
    await visible('Reset live experiment')
    for (const page of views) {
      const lab = page.locator('[data-lab="color"]')
      await lab.getByRole('slider').fill('0')
      await expect(lab.locator('.study-output')).toContainText('below')
      await lab.getByRole('button', { name: 'Reset live experiment' }).click()
      await expect(lab.getByRole('slider')).toHaveValue('0.7')
    }
  })
  await visible('Reset experiment')
  checks.push('CSS and Svelte edits update both browsers; the changed interactive island still operates and resets')
  for (const page of views) {
    await page.waitForLoadState('networkidle')
    await page.goto(origin + '/studies/service')
    const study = page.locator('[data-study="service"]')
    await study.getByRole('button', { name: 'Review request' }).click()
    await expect(study.locator('input[aria-invalid="true"]')).toHaveCount(2)
  }
  checks.push('Complete service case hydrates and validates in both engines under dev')
  // Restored files are prepared again on startup; restarting also checks fresh process state.
  await stop()
  await rm(resolve(modules, '.vite'), { recursive: true, force: true })
  await start()
  assert.equal((await fetch(origin + '/studies/workspace')).status, 200)
  checks.push('Second empty-cache startup serves the guide and workspace successfully')
  const report = { node: process.version, engines: browsers.map(browser => browser.version()), checks, result: 'pass' }
  await writeFile(resolve(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally {
  for (const [index, page] of views.entries()) await page.screenshot({ path: resolve(directory, `last-${index}.png`) }).catch(() => {})
  await writeFile(resolve(directory, 'clients.log'), clientLogs.join('\n'))
  await Promise.allSettled(browsers.map(browser => browser.close()))
  await stop()
  await writeFile(resolve(directory, 'server.log'), logs)
}
