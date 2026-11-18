import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { inspectDshPackageLicenses } from './verify-dsh-package-licenses.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function writeManifest(root: string, file: string, manifest: Record<string, unknown>): void {
  const path = join(root, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

function createWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'dsh-package-licenses-'))
  roots.push(root)
  writeManifest(root, 'package.json', {
    name: '@deepseek-ai/dsh-root',
    license: 'MIT',
    workspaces: ['apps/*', 'packages/*/*', 'vendor/*'],
  })
  return root
}

describe('DSH package license gate', () => {
  it('checks root, unhyphenated CLI, and dsh-prefixed package names while ignoring other families', () => {
    const root = createWorkspace()
    writeManifest(root, 'apps/cli/package.json', { name: '@deepseek-ai/dsh', license: 'MIT' })
    writeManifest(root, 'packages/core/agent/package.json', {
      name: '@deepseek-ai/dsh-agent',
      license: 'BSD-3-Clause',
    })
    writeManifest(root, 'vendor/cordis/package.json', {
      name: '@deepseek-ai/cordis',
      license: 'BSD-3-Clause',
    })

    expect(inspectDshPackageLicenses(root)).toEqual({
      packageCount: 3,
      failures: [
        'packages/core/agent/package.json: @deepseek-ai/dsh-agent must declare "license": "MIT"; found "BSD-3-Clause".',
      ],
    })
  })

  it('rejects a missing license declaration', () => {
    const root = createWorkspace()
    writeManifest(root, 'packages/core/agent/package.json', { name: '@deepseek-ai/dsh-agent' })

    expect(inspectDshPackageLicenses(root).failures).toEqual([
      'packages/core/agent/package.json: @deepseek-ai/dsh-agent must declare "license": "MIT"; found undefined.',
    ])
  })
})


describe('Skill Hub adapted-source notices', () => {
  it('accepts the combined license only for the attributed Skill Hub packages', () => {
    const root = createWorkspace()
    for (const directory of ['packages/skill/skill-hub', 'packages/client/ui-skill-hub']) {
      writeManifest(root, `${directory}/package.json`, {
        name: directory.includes('/client/') ? '@deepseek-ai/dsh-client-ui-skill-hub' : '@deepseek-ai/dsh-skill-hub',
        license: 'MIT AND Apache-2.0',
      })
      writeFileSync(join(root, directory, 'NOTICE'), 'Adapted from MichengAI/dsh-skills-manager.')
      writeFileSync(join(root, directory, 'LICENSE.Apache-2.0'), 'Apache License, Version 2.0')
    }
    writeManifest(root, 'packages/core/other/package.json', { name: '@deepseek-ai/dsh-other', license: 'MIT AND Apache-2.0' })
    expect(inspectDshPackageLicenses(root).failures).toEqual([
      'packages/core/other/package.json: @deepseek-ai/dsh-other must declare "license": "MIT"; found "MIT AND Apache-2.0".',
    ])
  })

  it('rejects adapted Skill Hub packages with missing notices', () => {
    const root = createWorkspace()
    writeManifest(root, 'packages/skill/skill-hub/package.json', { name: '@deepseek-ai/dsh-skill-hub', license: 'MIT AND Apache-2.0' })
    expect(inspectDshPackageLicenses(root).failures).toEqual([
      'packages/skill/skill-hub/package.json: adapted sources require NOTICE and LICENSE.Apache-2.0.',
    ])
  })
})
