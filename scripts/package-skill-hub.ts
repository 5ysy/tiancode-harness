/** Create an offline-installable Skill Hub bundle with its Host and Client packages embedded. */
import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { build } from 'tsdown'
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'

interface ReleaseManifest {
  name: string
  version: string
  files: string[]
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
  bundledDependencies?: string[]
  peerDependenciesMeta?: Record<string, { optional: boolean }>
  engines?: { dsh: string }
}

const root = resolve(import.meta.dirname, '..')

async function main(): Promise<void> {
  const destination = resolve(process.argv[2] ?? join(root, '.artifacts/skill-hub-release'))
  await mkdir(destination, { recursive: true })
  const temporary = await mkdtemp(join(tmpdir(), 'tiancode-skill-hub-pack-'))
  try {
    const bundle = join(temporary, 'package')
    await mkdir(bundle)
    const bundleSource = join(root, 'packages/experimental/skill-hub-bundle')
    const manifest = JSON.parse(await readFile(join(bundleSource, 'package.json'), 'utf8')) as ReleaseManifest
    manifest.files = ['LICENSE', 'lib', 'src', 'locale', 'cordis.patch.yml', 'README.md', 'README.zh.md', 'node_modules']
    manifest.bundledDependencies = Object.keys(manifest.dependencies)
    manifest.devDependencies = {}
    manifest.engines = { dsh: '>=0.2.2-rc.4 <0.3.0' }
    manifest.peerDependenciesMeta = Object.fromEntries(Object.keys(manifest.peerDependencies).map(name => [name, { optional: true }]))
    await writeFile(join(bundle, 'package.json'), JSON.stringify(manifest, null, 2))
    for (const file of ['LICENSE', 'lib', 'src', 'locale', 'cordis.patch.yml', 'README.md', 'README.zh.md']) await cp(join(bundleSource, file), join(bundle, file), { recursive: true })
    for (const relative of ['packages/skill/skill-hub', 'packages/client/ui-skill-hub']) {
      const source = join(root, relative)
      const child = JSON.parse(await readFile(join(source, 'package.json'), 'utf8')) as ReleaseManifest
      const target = join(bundle, 'node_modules', child.name)
      await mkdir(target, { recursive: true })
      for (const file of ['LICENSE', 'lib', 'src', 'locale', 'NOTICE', 'LICENSE.Apache-2.0', 'README.md', 'README.zh.md']) await cp(join(source, file), join(target, file), { recursive: true })
      child.devDependencies = {}
      if (relative.startsWith('packages/skill')) {
        await build({ cwd: source, config: false, entry: ['lib/types/index.js'], outDir: join(target, 'lib'), format: ['esm'], platform: 'node', target: 'es2024', fixedExtension: false, dts: false, clean: false,
          deps: { alwaysBundle: ['yaml', '@deepseek-ai/dsh-skill-filesystem', 'chokidar', 'readdirp'] } })
        child.dependencies = {}
        child.peerDependencies = { '@deepseek-ai/cordis': '*', '@deepseek-ai/schemastery': '*', '@deepseek-ai/dsh-skill': '*', '@deepseek-ai/dsh-home-paths': '*' }
      }
      child.peerDependenciesMeta = Object.fromEntries(Object.keys(child.peerDependencies).map(name => [name, { optional: true }]))
      await writeFile(join(target, 'package.json'), JSON.stringify(child, null, 2))
    }
    const filename = `${manifest.name.replace('@', '').replace('/', '-')}-${manifest.version}.tgz`
    // npm pack includes bundled node_modules without resolving packages or running lifecycle scripts.
    execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', destination], { cwd: bundle, stdio: 'pipe' })
    const serverBase = process.env.SKILL_HUB_PUBLIC_URL
    if (serverBase !== undefined) {
      const base = new URL(serverBase)
      if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/')) throw new Error('SKILL_HUB_PUBLIC_URL must be an HTTP(S) directory URL ending in /')
      const index = { format: 1, title: 'TianCode Skill Hub', plugins: [{ name: manifest.name, title: { zh: 'TianCode 技能中心', en: 'TianCode Skill Hub' }, versions: [{ version: manifest.version, publishTimestamp: Math.floor(Date.now() / 1000), source: { type: 'tarball', url: new URL(filename, base).href }, engines: manifest.engines }] }] }
      parseMarketIndex(index, new URL('plugin-market.json', base).href)
      await writeFile(join(destination, 'plugin-market.json'), JSON.stringify(index, null, 2) + '\n')
    }
    console.log(`Packaged ${join(destination, filename)}`)
  } finally { await rm(temporary, { recursive: true, force: true }) }
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Packaging failed'); process.exitCode = 1 })
