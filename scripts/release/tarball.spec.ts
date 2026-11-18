/** Packed archive inspection preserves UTF-8 paths independently of the host locale. */
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { create } from 'tar'
import { expect, it, onTestFinished } from 'vitest'
import { removeFixtureSafely } from '../test-fixture-cleanup.ts'

const require = createRequire(import.meta.url)

it('reads packed paths and manifests under an ASCII process locale', () => {
  const root = mkdtempSync(join(tmpdir(), 'dsh-tarball-locale-'))
  onTestFinished(() => { removeFixtureSafely(root) })
  mkdirSync(join(root, 'package/docs'), { recursive: true })
  const manifest = { name: '@deepseek-ai/dsh-probe', version: '1.2.3', description: '技能模板' }
  const resource = 'package/docs/公安警察工作汇报PPT模板.pptx'
  writeFileSync(join(root, 'package/package.json'), JSON.stringify(manifest))
  writeFileSync(join(root, resource), 'fixture')
  const archive = join(root, 'probe.tgz')
  create({ file: archive, cwd: root, sync: true, gzip: true }, ['package'])
  const script = join(root, 'read.mjs')
  writeFileSync(script, [
    `import { tarballFiles, packedManifest } from ${JSON.stringify(new URL('./tarball.ts', import.meta.url).href)}`,
    'const archive = process.argv[2]',
    'console.log(JSON.stringify({ files: tarballFiles(archive), manifest: packedManifest(archive) }))',
    '',
  ].join('\n'))
  // The child owns its locale so other test workers retain their original environment.
  const result = spawnSync(process.execPath, ['--import', pathToFileURL(require.resolve('tsx/esm')).href, script, archive], {
    env: { ...process.env, LC_ALL: 'C', LANG: 'C' }, encoding: 'utf8', timeout: 30_000,
  })
  expect(result.error).toBeUndefined()
  expect(result.signal).toBeNull()
  expect(result.status, result.stderr).toBe(0)
  const output: unknown = JSON.parse(result.stdout)
  if (output === null || typeof output !== 'object' || !('files' in output) || !('manifest' in output)) {
    throw new Error('Archive inspection child returned no file list or manifest')
  }
  expect(output.files).toContain(resource)
  expect(output.manifest).toEqual(manifest)
})
