/** Build immutable private catalog files from reviewed local skill directories. */
import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { parseDocument } from 'yaml'
import { isSkillName } from '@deepseek-ai/dsh-skill'
import { decodePackage } from './installer.ts'
import { parseSkillHubIndex, record, renderInstalledSkill } from './catalog.ts'
import type { SkillHubEntry, SkillHubIndex } from './types.ts'

/**
 * Publish a catalog from complete skill directories without following symbolic links.
 * Old content-addressed packages remain valid while the index is replaced atomically.
 * @param sources - reviewed directories, each containing SKILL.md.
 * @param output - static server document root.
 * @returns validated catalog that was written.
 */
export async function buildCatalog(sources: readonly string[], output: string): Promise<SkillHubIndex> {
  const skills: SkillHubEntry[] = []
  const packages = new Map<string, Buffer>()
  for (const source of sources) {
    const entries: { path: string; data: string; executable?: true }[] = []
    let size = 0
    async function collect(directory: string, prefix: string): Promise<void> {
      for (const child of (await readdir(directory)).sort()) {
        if (child.startsWith('.')) throw new Error(`Hidden file in skill ${basename(source)}; review the source before publishing`)
        const path = join(directory, child)
        const stat = await lstat(path)
        const relative = prefix + child
        if (stat.isSymbolicLink()) throw new Error(`Symbolic link in skill ${basename(source)}`)
        if (stat.isDirectory()) { await collect(path, relative + '/'); continue }
        if (!stat.isFile()) throw new Error('Skill contains a non-regular file')
        size += stat.size
        if (size > 8 * 1024 * 1024 || entries.length >= 1000) throw new Error('Skill exceeds default catalog package limits')
        entries.push({ path: relative, data: (await readFile(path)).toString('base64'), ...(stat.mode & 0o111) !== 0 ? { executable: true } : {} })
      }
    }
    const stat = await lstat(source)
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Each source must be a real skill directory')
    await collect(source, '')
    const markdown = entries.find(entry => entry.path === 'SKILL.md')
    if (markdown === undefined) throw new Error('Each source requires SKILL.md')
    const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(Buffer.from(markdown.data, 'base64').toString('utf8'))
    if (match === null || match[1] === undefined) throw new Error('SKILL.md requires YAML frontmatter')
    const document = parseDocument(match[1])
    if (document.errors.length > 0) throw new Error('Invalid SKILL.md frontmatter')
    const metadata: unknown = document.toJS({ maxAliasCount: 20 })
    if (!record(metadata) || typeof metadata.name !== 'string' || !isSkillName(metadata.name) || typeof metadata.description !== 'string') throw new Error('Invalid skill identity')
    const bytes = Buffer.from(JSON.stringify({ name: metadata.name, entries }))
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const path = `packages/${metadata.name}-${sha256}.json`
    const entry = { id: metadata.name, name: metadata.name, title: metadata.name, description: metadata.description, package: path, sha256 }
    decodePackage({ name: metadata.name, entries }, entry, { maxBytes: 8 * 1024 * 1024, maxFiles: 1000 })
    renderInstalledSkill(entry, { category: 'other', label: { zh: entry.title, en: entry.title } }, Buffer.from(markdown.data, 'base64').toString('utf8'))
    skills.push(entry)
    packages.set(path, bytes)
  }
  const index = parseSkillHubIndex({ version: 1, skills })
  await mkdir(join(output, 'packages'), { recursive: true })
  for (const [path, bytes] of packages) await writeFile(join(output, path), bytes)
  const temporary = join(output, `catalog-${process.pid}.tmp`)
  await writeFile(temporary, JSON.stringify(index, null, 2) + '\n')
  await rename(temporary, join(output, 'catalog.json'))
  return index
}
