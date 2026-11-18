import { createHash } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { installPackage, readBounded } from '../src/installer.ts'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
const entry = { id: 'writer', name: 'writer', title: 'Writer', description: 'Write', package: 'packages/writer.json', sha256: '' }
const metadata = { category: 'document' as const, label: { zh: '写作', en: 'Writer' } }
const files = [{ path: 'SKILL.md', data: Buffer.from('---\nname: writer\ndescription: Write\n---\nUse references/style.md').toString('base64') }, { path: 'references/style.md', data: Buffer.from('Style guide').toString('base64') }]
async function root() { const dir = await mkdtemp(join(tmpdir(), 'dsh-skill-hub-')); roots.push(dir); return dir }
function bundle(entries = files) { const bytes = Buffer.from(JSON.stringify({ name: 'writer', entries })); return { bytes, selected: { ...entry, sha256: createHash('sha256').update(bytes).digest('hex') } } }
function run(dir: string, entries = files, signal = new AbortController().signal) {
  const { bytes, selected } = bundle(entries)
  return installPackage(dir, selected, metadata, bytes, { maxFiles: 100, maxBytes: 1024 * 1024 }, signal)
}

describe('whole-directory installation', () => {
  it('publishes resources and refuses to overwrite an existing skill', async () => {
    const dir = await root()
    await run(dir)
    expect(await readFile(join(dir, 'writer/references/style.md'), 'utf8')).toBe('Style guide')
    expect(await readFile(join(dir, 'writer/SKILL.md'), 'utf8')).toContain('tiancode:')
    await expect(run(dir)).rejects.toThrow('conflict')
    expect(await readdir(dir)).toEqual(['writer'])
  })
  it.each(['../escape', '/absolute', 'x/../../escape', 'C:/escape', 'x\\escape', 'CON', 'references/STYLE.md', 'SKILL.md/child'])('rejects unsafe or conflicting paths: %s', async (path) => {
    const dir = await root()
    await expect(run(dir, [...files, { path, data: 'YQ==' }])).rejects.toThrow()
    expect(await readdir(dir)).toEqual([])
  })
  it('rejects tampering and aborted work before publication', async () => {
    const dir = await root()
    const { bytes, selected } = bundle()
    await expect(installPackage(dir, { ...selected, sha256: '0'.repeat(64) }, metadata, bytes, { maxFiles: 100, maxBytes: 100000 }, new AbortController().signal)).rejects.toThrow('checksum')
    await expect(run(dir, files, AbortSignal.abort())).rejects.toThrow()
    expect(await readdir(dir)).toEqual([])
  })
  it.skipIf(process.platform === 'win32')('refuses a symlink installation root', async () => {
    const parent = await root(); const target = await root()
    await symlink(target, join(parent, 'linked'))
    await expect(run(join(parent, 'linked'))).rejects.toThrow('symlink')
    expect(await readdir(target)).toEqual([])
  })
  it('allows only one publisher when installs race', async () => {
    const dir = await root()
    const results = await Promise.allSettled([run(dir), run(dir)])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(await readdir(dir)).toEqual(['writer'])
  })
})

describe('bounded upstream response', () => {
  it('cancels a chunked oversized body without buffering the whole response', async () => {
    let cancelled = false
    const body = new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(new Uint8Array(8)) }, cancel() { cancelled = true },
    })
    await expect(readBounded(new Response(body), 10)).rejects.toThrow('size')
    expect(cancelled).toBe(true)
  })
})
