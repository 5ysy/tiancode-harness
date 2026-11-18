import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { buildCatalog } from '../src/builder.ts'
import { installPackage } from '../src/installer.ts'
const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
it('builds and installs a catalog with resources and the source license', async () => {
  const root = await mkdtemp(join(tmpdir(), 'skill-hub-builder-')); roots.push(root)
  const source = join(root, 'source'); const output = join(root, 'public')
  await mkdir(join(source, 'references'), { recursive: true })
  await writeFile(join(source, 'SKILL.md'), '---\nname: writer\ndescription: Write\nmetadata:\n  author: Community\n---\nRead references/style.md\n')
  await writeFile(join(source, 'LICENSE.txt'), 'Example license')
  await writeFile(join(source, 'references/style.md'), 'Style guide')
  await writeFile(join(source, 'references/参考 (1).md'), 'Unicode resource')
  const catalog = await buildCatalog([source], output)
  const entry = catalog.skills[0]
  if (entry === undefined) throw new Error('Missing generated entry')
  await installPackage(join(root, 'installed'), entry, { category: 'document', label: { zh: '文档', en: 'Writer' } }, await readFile(join(output, entry.package)), { maxBytes: 100000, maxFiles: 100 }, new AbortController().signal)
  expect(await readFile(join(root, 'installed/writer/references/参考 (1).md'), 'utf8')).toBe('Unicode resource')
  expect(await readFile(join(root, 'installed/writer/LICENSE.txt'), 'utf8')).toBe('Example license')
  expect(await readFile(join(root, 'installed/writer/references/style.md'), 'utf8')).toBe('Style guide')
  await writeFile(join(source, 'references', 'invalid:name'), 'Invalid on Windows')
  await expect(buildCatalog([source], output)).rejects.toThrow()
})
