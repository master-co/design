import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { validateSkillBoundaries, publicSkillPath, internalSkillPath } from '../scripts/skill-boundaries.mjs'
const root = resolve(import.meta.dirname, '..')

test('one public skill coexists with an explicitly internal authoring skill', async () => {
  await validateSkillBoundaries(root)
  const release = await readFile(resolve(root, 'scripts/release.mjs'), 'utf8')
  assert(release.includes("'HEAD:skills/master-design'"), 'Release continues to archive only the public subtree')
  const archive = execFileSync('git', ['archive', '--format=tar', 'HEAD:skills/master-design'], { cwd: root })
  const listing = execFileSync('tar', ['-tf', '-'], { input: archive, encoding: 'utf8' })
  assert(listing.split('\n').includes('SKILL.md'))
  assert(!/doc-illustrations|site\/|\.agents\//.test(listing))
})

test('extra public skills and an unmarked internal skill are rejected', async () => {
  await mkdir(resolve(root, 'artifacts'), { recursive: true })
  const directory = await mkdtemp(resolve(root, 'artifacts/skill-boundary-'))
  try {
    await cp(resolve(root, publicSkillPath), join(directory, publicSkillPath), { recursive: true })
    await cp(resolve(root, internalSkillPath), join(directory, internalSkillPath), { recursive: true })
    // Archive the edited files from an isolated tree without committing or touching the real index.
    execFileSync('git', ['init', '--quiet', directory])
    execFileSync('git', ['add', 'skills', '.agents'], { cwd: directory })
    const tree = execFileSync('git', ['write-tree'], { cwd: directory, encoding: 'utf8' }).trim()
    const archive = execFileSync('git', ['archive', '--format=tar', `${tree}:skills/master-design`], { cwd: directory })
    const listing = execFileSync('tar', ['-tf', '-'], { input: archive, encoding: 'utf8' })
    assert(listing.includes('references/foundations/localization.md'))
    assert(listing.includes('references/patterns/editing.md'))
    assert(!/doc-illustrations|site\/|\.agents\//.test(listing), 'The working-tree public archive excludes internal tooling')
    await mkdir(join(directory, 'skills/accidental'), { recursive: true })
    await writeFile(join(directory, 'skills/accidental/SKILL.md'), '# Accidental public skill')
    await assert.rejects(validateSkillBoundaries(directory), /Exactly one public skill/)
    await rm(join(directory, 'skills/accidental'), { recursive: true })
    const internal = join(directory, internalSkillPath, 'SKILL.md')
    await writeFile(internal, (await readFile(internal, 'utf8')).replace('internal: true', 'internal: false'))
    await assert.rejects(validateSkillBoundaries(directory), /ordinary discovery/)
  } finally { await rm(directory, { recursive: true, force: true }) }
})
