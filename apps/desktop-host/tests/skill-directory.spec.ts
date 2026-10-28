/** Application skill seeding preserves user edits and does not scan agent directories. */
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { prepareSkillDirectory } from '../src/skill-directory.ts'

it('seeds missing bundles while preserving edited skills and supporting source development', async () => {
  const root = await mkdtemp(join(tmpdir(), 'tiancode-skills-'))
  try {
    const source = join(root, 'resources', 'skills')
    const target = join(root, 'home', 'skills')
    await mkdir(join(source, 'custom'), { recursive: true })
    await writeFile(join(source, 'custom', 'SKILL.md'), 'bundled')
    await prepareSkillDirectory(source, target)
    expect(await readFile(join(target, 'custom', 'SKILL.md'), 'utf8')).toBe('bundled')
    await writeFile(join(target, 'custom', 'SKILL.md'), 'user edit')
    await mkdir(join(source, 'new-skill'))
    await writeFile(join(source, 'new-skill', 'SKILL.md'), 'new default')
    await prepareSkillDirectory(source, target)
    expect(await readFile(join(target, 'custom', 'SKILL.md'), 'utf8')).toBe('user edit')
    expect(await readFile(join(target, 'new-skill', 'SKILL.md'), 'utf8')).toBe('new default')
    await prepareSkillDirectory(source, source)
    expect(await readFile(join(source, 'custom', 'SKILL.md'), 'utf8')).toBe('bundled')
  } finally { await rm(root, { recursive: true, force: true }) }
})
