/** Writable application skill bundles, seeded without replacing user-authored files. */
import { cp, mkdir, mkdtemp, readdir, rename, rm, stat } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'

/**
 * Seed application skills on first use and add missing bundled directories on upgrade.
 * @param source - Absolute, shipped skill directory.
 * @param destination - Absolute, writable application skill directory; source development may use source itself.
 * @returns Resolves when every missing bundle has been copied. Existing bundles remain user-owned.
 * @throws When either path is relative or the shipped resources cannot be read.
 */
export async function prepareSkillDirectory(source: string, destination: string): Promise<void> {
  if (!isAbsolute(source) || !isAbsolute(destination)) throw new Error('desktop-office: skill directories must be absolute')
  if (!(await stat(source)).isDirectory()) throw new Error(`desktop-office: invalid bundled skill directory ${source}`)
  if (resolve(source) === resolve(destination)) return
  await mkdir(destination, { recursive: true })
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const target = join(destination, entry.name)
    try {
      await stat(target)
      continue
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    const staging = await mkdtemp(join(dirname(destination), '.tiancode-skill-'))
    try {
      const bundle = join(staging, entry.name)
      await cp(join(source, entry.name), bundle, { recursive: true, force: false, errorOnExist: true })
      await rename(bundle, target)
    } finally { await rm(staging, { recursive: true, force: true }) }
  }
}
