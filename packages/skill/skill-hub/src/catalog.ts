/** Private catalog documents and TianCode installation metadata. */
import { parseDocument } from 'yaml'
import { isSkillName } from '@deepseek-ai/dsh-skill'

/** Categories understood by TianCode's composer. */
export const categories = ['chat', 'ppt', 'document', 'report', 'data', 'law', 'proofread', 'other'] as const

import type { SkillHubEntry, SkillHubIndex, TianCodeMetadata } from './types.ts'
export type { SkillHubEntry, SkillHubIndex, TianCodeMetadata } from './types.ts'

/**
 * Validate an untrusted private catalog, including unique ids and names.
 * @param value - decoded JSON.
 * @returns normalized catalog.
 */
export function parseSkillHubIndex(value: unknown): SkillHubIndex {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.skills) || value.skills.length > 2000) throw new TypeError('Invalid Skill Hub index')
  const ids = new Set<string>()
  const names = new Set<string>()
  const skills = value.skills.map((item: unknown): SkillHubEntry => {
    if (!record(item) || !skillName(item.id) || !skillName(item.name) || !text(item.title, 200) || !text(item.description, 2000)
      || !safePackagePath(item.package) || typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(item.sha256)) throw new TypeError('Invalid catalog entry')
    if (ids.has(item.id) || names.has(item.name)) throw new TypeError('Duplicate catalog identity')
    ids.add(item.id); names.add(item.name)
    if (item.author !== undefined && !text(item.author, 200)) throw new TypeError('Invalid author')
    if (item.repository !== undefined && !text(item.repository, 2000)) throw new TypeError('Invalid repository')
    return { id: item.id, name: item.name, title: item.title.trim(), description: item.description.trim(),
      package: item.package, sha256: item.sha256,
      ...typeof item.author === 'string' ? { author: item.author } : {}, ...typeof item.repository === 'string' ? { repository: item.repository } : {} }
  })
  return { version: 1, skills }
}

/**
 * Validate metadata before any download or filesystem mutation.
 * @param index - accepted catalog.
 * @param value - caller's JSON request.
 * @returns catalog entry and exact TianCode metadata.
 */
export function validateInstallSelection(
  index: SkillHubIndex, value: unknown,
): { entry: SkillHubEntry; metadata: TianCodeMetadata } {
  if (!record(value) || !skillName(value.skillId) || !record(value.metadata)) throw new TypeError('Invalid install request')
  const entry = index.skills.find(item => item.id === value.skillId)
  const meta = value.metadata
  if (entry === undefined || Object.keys(meta).some(key => !['category', 'label', 'parent', 'order'].includes(key))) throw new TypeError('Invalid skill or metadata fields')
  const category = categories.find(candidate => candidate === meta.category)
  if (category === undefined || !record(meta.label) || !text(meta.label.zh, 200) || !text(meta.label.en, 200)
    || Object.keys(meta.label).some(key => key !== 'zh' && key !== 'en')) throw new TypeError('Invalid category or display labels')
  if (meta.parent !== undefined && (!skillName(meta.parent) || meta.parent === entry.name)) throw new TypeError('Invalid parent')
  if (meta.order !== undefined && (typeof meta.order !== 'number' || !Number.isSafeInteger(meta.order))) throw new TypeError('Invalid order')
  return { entry, metadata: { category, label: { zh: meta.label.zh.trim(), en: meta.label.en.trim() },
    ...typeof meta.parent === 'string' ? { parent: meta.parent } : {}, ...typeof meta.order === 'number' ? { order: meta.order } : {} } }
}

/**
 * Merge only TianCode fields and retain community frontmatter, comments, and body.
 * @param entry - catalog identity which the original SKILL.md must match.
 * @param metadata - validated installation metadata.
 * @param content - original UTF-8 SKILL.md.
 * @returns complete instruction document.
 */
export function renderInstalledSkill(entry: SkillHubEntry, metadata: TianCodeMetadata, content: string): string {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(content)
  if (match === null || match[1] === undefined) throw new TypeError('SKILL.md requires YAML frontmatter')
  const document = parseDocument(match[1], { uniqueKeys: true })
  if (document.errors.length > 0) throw new TypeError('Invalid SKILL.md YAML')
  const data: unknown = document.toJS({ maxAliasCount: 20 })
  if (!record(data) || data.name !== entry.name || !text(data.description, 2000)) throw new TypeError('SKILL.md identity does not match the catalog')
  if (data.metadata !== undefined && !record(data.metadata)) throw new TypeError('Skill metadata must be a mapping')
  if (data['user-invocable'] !== undefined && typeof data['user-invocable'] !== 'boolean') throw new TypeError('Invalid invocation policy')
  if (data['disable-model-invocation'] !== undefined && typeof data['disable-model-invocation'] !== 'boolean') throw new TypeError('Invalid invocation policy')
  document.setIn(['metadata', 'tiancode'], metadata)
  return `---\n${document.toString()}---\n${match[2]}`
}

function safePackagePath(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 300 && /^packages\/[a-z0-9-]+\.json$/.test(value)
}

function skillName(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 100 && isSkillName(value)
}

function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

/**
 * Narrow decoded JSON maps without accepting arrays or null.
 * @param value - untrusted JSON.
 * @returns whether string keys may be inspected.
 */
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
