/** Directory-preserving imports adapted from MichengAI/dsh-skills-manager (Apache-2.0); see NOTICE. */
import { createHash } from 'node:crypto'
import { lstat, mkdir, mkdtemp, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { record, renderInstalledSkill, type SkillHubEntry, type TianCodeMetadata } from './catalog.ts'

/** Aggregate limits applied before writing any package file. */
export interface PackageLimits {
  readonly maxBytes: number
  readonly maxFiles: number
}

/**
 * Read an upstream body with a streaming byte cap, cancelling rejected bodies.
 * @param response - fetched response.
 * @param limit - maximum wire bytes.
 * @returns bounded bytes.
 */
export async function readBounded(response: Response, limit: number): Promise<Buffer> {
  const reader = response.body?.getReader()
  if (reader === undefined) return Buffer.alloc(0)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    const declared = Number(response.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > limit) throw new RangeError('Response exceeds size limit')
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) throw new RangeError('Response exceeds size limit')
      chunks.push(value)
    }
    return Buffer.concat(chunks, size)
  } catch (error) {
    try { await reader.cancel() } catch (cancelError) {
      // The original stream failure owns the report; cancellation may reject on an already failed body.
      if (cancelError === error) throw error
    }
    throw error
  } finally { reader.releaseLock() }
}

/**
 * Verify and stage a complete skill package, then publish its nonempty directory.
 * Existing directories and symlinks are conflicts; files are never overwritten.
 * @param root - plugin-owned installation root.
 * @param entry - catalog identity and SHA-256.
 * @param metadata - validated TianCode fields.
 * @param bytes - bounded JSON package, compatible with upstream CatalogPackage.entries.
 * @param limits - decoded aggregate and file-count limits.
 * @param signal - request/plugin lifetime; checked before publication.
 * @returns after publication and staging cleanup complete.
 */
export async function installPackage(
  root: string, entry: SkillHubEntry, metadata: TianCodeMetadata,
  bytes: Uint8Array, limits: PackageLimits, signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted()
  if (createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new TypeError('Package checksum mismatch')
  const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  const files = decodePackage(payload, entry, limits)
  const document = files.get('SKILL.md')
  if (document === undefined) throw new TypeError('Package requires SKILL.md')
  files.set('SKILL.md', { data: Buffer.from(renderInstalledSkill(entry, metadata, new TextDecoder('utf-8', { fatal: true }).decode(document.data))), executable: false })
  await mkdir(root, { recursive: true, mode: 0o700 })
  const rootStat = await lstat(root)
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error('Installation root is a symlink or not a directory')
  const canonical = await realpath(root)
  const target = join(canonical, entry.name)
  if (await exists(target)) throw new Error('Installation conflict')
  const stage = await mkdtemp(join(canonical, '.stage-'))
  try {
    for (const [path, file] of files) {
      signal.throwIfAborted()
      const destination = join(stage, path)
      await mkdir(dirname(destination), { recursive: true, mode: 0o700 })
      await writeFile(destination, file.data, { flag: 'wx', mode: file.executable ? 0o700 : 0o600 })
    }
    signal.throwIfAborted()
    // A competing publisher leaves a nonempty target; rename then refuses replacement on every supported platform.
    if (await exists(target)) throw new Error('Installation conflict')
    await rename(stage, target)
  } finally { await rm(stage, { recursive: true, force: true }) }
}

type PackageFile = { readonly data: Buffer; readonly executable: boolean }

/**
 * Validate package entries before any filesystem operations.
 * @param value - decoded untrusted package JSON.
 * @param entry - catalog identity.
 * @param limits - decoded byte and file-count caps.
 * @returns validated relative files.
 */
export function decodePackage(value: unknown, entry: SkillHubEntry, limits: PackageLimits): Map<string, PackageFile> {
  if (!record(value) || value.name !== entry.name || !Array.isArray(value.entries) || value.entries.length === 0 || value.entries.length > limits.maxFiles) throw new TypeError('Invalid skill package')
  const files = new Map<string, PackageFile>()
  const paths = new Set<string>()
  let size = 0
  for (const file of value.entries) {
    if (!record(file) || typeof file.path !== 'string' || !safePath(file.path) || typeof file.data !== 'string'
      || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.data)
      || (file.executable !== undefined && typeof file.executable !== 'boolean')) throw new TypeError('Invalid package file')
    const key = file.path.toLowerCase()
    if (paths.has(key)) throw new TypeError('Conflicting package paths')
    paths.add(key)
    const data = Buffer.from(file.data, 'base64')
    size += data.length
    if (size > limits.maxBytes) throw new RangeError('Package exceeds size limit')
    files.set(file.path, { data, executable: file.executable === true })
  }
  for (const key of paths) {
    const segments = key.split('/')
    segments.pop()
    while (segments.length > 0) {
      if (paths.has(segments.join('/'))) throw new TypeError('Conflicting package paths')
      segments.pop()
    }
  }
  return files
}

function safePath(path: string): boolean {
  return path.length <= 240 && path.split('/').every(part => part !== '' && part !== '.' && part !== '..' && !/[<>:\"\\|?*\u0000-\u001f\u007f]/.test(part)
    && !part.endsWith('.') && !part.endsWith(' ')
    && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part))
}

async function exists(path: string): Promise<boolean> {
  try { await lstat(path); return true } catch (error) {
    if (record(error) && error.code === 'ENOENT') return false
    throw error
  }
}
