/** Product categories for bundled and author-classified composer skills. */
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'

type Category = NonNullable<NonNullable<SkillEntry['shortcut']>['category']>

/** Stable display order shared by every enabled office composer. */
export const featureCategories = ['chat', 'ppt', 'document', 'report', 'data', 'law', 'proofread', 'other'] as const satisfies readonly Category[]

// Installed skill files are user-owned and may predate category metadata.
const bundledCategories: Readonly<Record<string, Category>> = {
  'public-ppt': 'ppt',
  'public-ppt-business': 'ppt',
  'public-ppt-internet': 'ppt',
  'public-ppt-police': 'ppt',
  'public-document': 'document',
  'public-minutes': 'document',
  'public-summary': 'document',
  'public-plan': 'document',
  'public-speech': 'document',
  'public-collaborative-writing': 'document',
  'public-internal-comms': 'document',
  'public-report': 'report',
  'public-report-annual': 'report',
  'public-report-country-brief': 'report',
  'public-report-country-hotspot': 'report',
  'public-report-country-monthly': 'report',
  'public-report-email': 'report',
  'public-report-event': 'report',
  'public-report-organization-brief': 'report',
  'public-report-organization-monthly': 'report',
  'public-report-organization-research': 'report',
  'public-ledger': 'data',
  'public-policy-research': 'law',
  'public-proofread': 'proofread',
  'public-document-format': 'proofread',
  'public-pdf': 'other',
}

/**
 * Resolve explicit categories, ancestor categories and older bundled skill names.
 * @param skill - Available skill to classify.
 * @param skills - Provider-filtered catalog used for parent lookup.
 * @returns Resolved category, or Other when no explicit or bundled classification applies.
 */
export function featureCategory(skill: SkillEntry, skills: ReadonlyMap<string, SkillEntry>): Category {
  const visited = new Set<string>()
  const lineage: SkillEntry[] = []
  let current: SkillEntry | undefined = skill
  while (current !== undefined && !visited.has(current.name)) {
    visited.add(current.name)
    lineage.push(current)
    if (current.shortcut?.category !== undefined) return current.shortcut.category
    current = current.shortcut?.parent === undefined ? undefined : skills.get(current.shortcut.parent)
  }
  for (const entry of lineage) {
    const category = Object.hasOwn(bundledCategories, entry.name) ? bundledCategories[entry.name] : undefined
    if (category !== undefined) return category
  }
  return 'other'
}
