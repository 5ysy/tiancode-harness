/** Draft transformations for explicitly selected user-invocable workflows. */

/**
 * Read an available leading skill from a draft.
 * @param draft - Persisted input text.
 * @param available - Current user-invocable skill names.
 * @returns The selected name, or null for ordinary text and unrelated commands.
 */
export function selectedFeature(draft: string, available: readonly string[]): string | null {
  const name = /^\/([^\s]+)(?:\s|$)/u.exec(draft)?.[1]
  return name !== undefined && available.includes(name) ? name : null
}

/**
 * Replace a known leading skill while retaining the authored body.
 * @param draft - Persisted input text.
 * @param target - Skill to select, or null to return to chat.
 * @param available - Current user-invocable skill names.
 * @returns Updated text, or null when an unavailable skill or unrelated command prevents selection.
 */
export function featureDraft(draft: string, target: string | null, available: readonly string[]): string | null {
  if (target !== null && !available.includes(target)) return null
  const current = selectedFeature(draft, available)
  if (draft.startsWith('/') && current === null) return null
  const body = current === null ? draft : draft.slice(current.length + 1).replace(/^\s/u, '')
  return target === null ? body : `/${target} ${body}`
}
