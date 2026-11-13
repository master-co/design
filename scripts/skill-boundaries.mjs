import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { parse } from 'yaml'

export const publicSkillPath = 'skills/master-design'
export const internalSkillPath = '.agents/skills/master-design-doc-illustrations'

export async function validateSkillBoundaries(root) {
  const entries = []
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      assert(!entry.isSymbolicLink(), `Skill sources must not escape through a symlink: ${entry.name}`)
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) await walk(path)
      else if (entry.name === 'SKILL.md') entries.push(relative(root, path))
    }
  }
  await walk(resolve(root, 'skills'))
  assert.deepEqual(entries, [`${publicSkillPath}/SKILL.md`], 'Exactly one public skill')
  const internal = await readFile(resolve(root, internalSkillPath, 'SKILL.md'), 'utf8')
  const metadata = parse(internal.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')
  assert.equal(metadata?.name, 'master-design-doc-illustrations')
  assert.equal(metadata?.metadata?.internal, true, 'Author skill is excluded from ordinary discovery')
  const publicSource = await readFile(resolve(root, publicSkillPath, 'SKILL.md'), 'utf8')
  assert(!publicSource.includes('master-design-doc-illustrations'), 'Public skill must not route to internal authoring')
  return { public: publicSkillPath, internal: internalSkillPath }
}
