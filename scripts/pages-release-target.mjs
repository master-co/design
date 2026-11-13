import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { channels } from './pages-site-manifest.mjs'

export function assertPagesTarget(project, { name, channel = 'main' }) {
  assert.ok(Object.hasOwn(channels, channel), 'Only main is a site delivery channel')
  assert.equal(project?.name, name, 'Cloudflare returned a different Pages project')
  assert.equal(project.production_branch, channels[channel].deliveryBranch, 'Selected Pages project has a different production branch')
  assert.ok(project.source?.type === 'github', 'Selected Pages project is not built from its Git repository')
  assert.ok(project.domains?.includes(new URL(channels[channel].origin).hostname), 'Selected Pages project does not serve the canonical hostname')
}

/**
 * An operator's read-only check with an independently supplied read credential: never creates
 * projects, changes domains or triggers builds. The delivery workflow holds no Cloudflare credential.
 * https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/
 */
export async function verifyPagesTarget(env = process.env, fetchProject = fetch) {
  for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'PAGES_PROJECT']) {
    assert.ok(env[key], `Missing ${key}; supply it to check the Pages target`)
  }
  const response = await fetchProject(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/pages/projects/${encodeURIComponent(env.PAGES_PROJECT)}`, {
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
    redirect: 'error',
    signal: AbortSignal.timeout(15000)
  })
  assert.ok(response.ok, `Pages target lookup failed (HTTP ${response.status})`)
  const payload = await response.json()
  assert.equal(payload.success, true, 'Pages target lookup was not successful')
  assertPagesTarget(payload.result, { name: env.PAGES_PROJECT })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyPagesTarget()
  console.log('Verified the Pages project, its Git source, production branch and canonical hostname; no deployment performed.')
}
