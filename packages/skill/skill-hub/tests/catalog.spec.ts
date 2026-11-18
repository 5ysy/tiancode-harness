import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { parseSkillHubIndex, renderInstalledSkill, validateInstallSelection } from '../src/catalog.ts'

const entry = { id: 'writer', name: 'writer', title: 'Writer', description: 'Write documents', package: 'packages/writer.json', sha256: 'a'.repeat(64) }
const index = { version: 1, skills: [entry] }
const metadata = { category: 'document' as const, label: { zh: '文档助手', en: 'Writer' }, order: 3, parent: 'public-document' }

describe('Skill Hub catalog and TianCode metadata', () => {
  it('merges the exact TianCode fields while preserving invocation policy and community metadata', () => {
    const content = '---\nname: writer\ndescription: Write documents\ndisable-model-invocation: true\nmetadata:\n  author: community\n---\n\nRead references/style.md.\n'
    const rendered = renderInstalledSkill(entry, metadata, content)
    const front = parse(rendered.split('---')[1] ?? '') as Record<string, unknown>
    expect(front.metadata).toEqual({ author: 'community', tiancode: metadata })
    expect(front['disable-model-invocation']).toBe(true)
    expect(rendered).toContain('Read references/style.md.')
  })
  it('rejects invalid categories, unknown metadata fields, unsafe order and self parents', () => {
    const parsed = parseSkillHubIndex(index)
    for (const bad of [{ ...metadata, category: 'custom' }, { ...metadata, values: {} }, { ...metadata, order: 1.5 }, { ...metadata, parent: 'writer' }, { ...metadata, label: { en: 'Writer' } }]) {
      expect(() => validateInstallSelection(parsed, { skillId: 'writer', metadata: bad })).toThrow()
    }
  })
  it('rejects duplicate names, mutable or escaping packages, and invalid checksums', () => {
    for (const skills of [[entry, { ...entry, id: 'other' }], [{ ...entry, package: '../secret' }], [{ ...entry, package: 'http://other/package' }], [{ ...entry, sha256: '' }]]) {
      expect(() => parseSkillHubIndex({ version: 1, skills })).toThrow()
    }
  })
  it('rejects a package whose declared name differs from its original skill', () => {
    expect(() => renderInstalledSkill(entry, metadata, '---\nname: different\ndescription: Test\n---\nBody')).toThrow()
  })
})
