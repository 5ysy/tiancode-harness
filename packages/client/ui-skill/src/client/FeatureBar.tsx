/** Composer shortcuts over the current session's user-invocable skill catalog. */
import { useEffect, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  IconNewChatOutlineRegular, IconDeliverDocRegular, IconListPenOutlineRegular,
  IconEditOutlineRegular, IconChecklistOutlineRegular, IconEllipsisOutlineRegular,
  IconSkillOutlineRegular, Menu, type MenuItem,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { featureCategories, featureCategory } from './feature-categories.ts'
import { featureDraft, selectedFeature } from './feature-draft.ts'
import css from './FeatureBar.module.css'

/** Immutable catalog publication shared with slash completion. */
export interface FeatureCatalog {
  /** Fetch lifecycle; idle is reloaded on mount or invalidation. */
  readonly status: 'idle' | 'loading' | 'ready' | 'error'
  /** Only user-invocable skills supplied by the current session. */
  readonly skills: readonly SkillEntry[]
}

/** Registrant-owned catalog source and configured shortcut order. */
export interface FeatureBarInjected {
  /** Start or retry the shared catalog fetch. */
  readonly loadCatalog: () => void
  /** Catalog notifications are adapted to React by the slot renderer. */
  readonly hooks: {
    readonly featureCatalog: HostObservable<FeatureCatalog>
    readonly quickActions: HostObservable<readonly string[]>
    readonly quickActionProviders: HostObservable<readonly string[]>
  }
}

/** Slot-derived input state, catalog and localized text. */
export type FeatureBarProps = PropsRuntime<'conversation.input.features'> & InjectFace<FeatureBarInjected> & PropsLocale<'skill'>

const icons = {
  chat: IconNewChatOutlineRegular, ppt: IconDeliverDocRegular, document: IconEditOutlineRegular,
  report: IconListPenOutlineRegular, data: IconChecklistOutlineRegular, law: IconSkillOutlineRegular,
  proofread: IconChecklistOutlineRegular, other: IconEllipsisOutlineRegular,
}

/**
 * Select a workflow by writing its visible slash invocation into the draft.
 * @param props - Composer lock, standard input actions, catalog and dictionary.
 * @returns Eight category menus containing the available user-invocable skills.
 */
export function FeatureBar({
  locked, useInput, inputActions, useFeatureCatalog, loadCatalog, useQuickActions, useQuickActionProviders, t,
}: FeatureBarProps) {
  const quickActions = useQuickActions(value => value)
  const providers = useQuickActionProviders(value => value)
  const input = useInput(value => value)
  const catalog = useFeatureCatalog(value => value)
  const [menu, setMenu] = useState<string | null>(null)
  useEffect(() => {
    if (quickActions.length > 0 && catalog.status === 'idle') loadCatalog()
  }, [catalog.status, loadCatalog, quickActions.length])
  const skills = catalog.skills.filter(skill => providers.length === 0
    || (skill.provider !== undefined && providers.includes(skill.provider)))
  const names = skills.map(skill => skill.name)
  const byName = new Map(skills.map(skill => [skill.name, skill]))
  const draft = input?.draft ?? ''
  const selected = selectedFeature(draft, names)
  const command = draft.startsWith('/') && selected === null
  const disabled = locked || input === undefined || input.phase !== 'plain' || command
  useEffect(() => { if (disabled) setMenu(null) }, [disabled])
  const locale = t('features.locale') === 'en' ? 'en' : 'zh'
  const label = (name: string): string => byName.get(name)?.shortcut?.label[locale] ?? name
  const choose = (name: string | null): void => {
    if (disabled || inputActions === undefined) return
    const updated = featureDraft(draft, name, names)
    if (updated !== null) inputActions.setDraft(updated)
    setMenu(null)
  }
  const categoryByName = new Map(skills.map(skill => [skill.name, featureCategory(skill, byName)]))
  const priority = new Map(quickActions.map((name, index) => [name, index]))
  const ordered = [...skills].sort((a, b) => (priority.get(a.name) ?? Number.MAX_SAFE_INTEGER)
    - (priority.get(b.name) ?? Number.MAX_SAFE_INTEGER) || (a.shortcut?.order ?? Number.MAX_SAFE_INTEGER)
    - (b.shortcut?.order ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
  if (quickActions.length === 0) return null
  return <div className={css.root} aria-label={t('features.label')}>
    <div className={css.row}>
      {featureCategories.map((category) => {
        const Icon = icons[category]
        const options: MenuItem[] = ordered.filter(skill => categoryByName.get(skill.name) === category)
          .map(skill => ({ id: skill.name, label: skill.shortcut?.parent !== undefined && byName.has(skill.shortcut.parent)
            ? `${label(skill.shortcut.parent)} · ${label(skill.name)}` : label(skill.name) }))
        if (category === 'chat') options.unshift({ id: ':ordinary-chat', label: t('features.ordinaryChat') })
        if (options.length === 0) options.push({ id: 'empty-category', label: t('features.empty'), disabled: true })
        const active = selected === null ? category === 'chat' && !command : categoryByName.get(selected) === category
        return <Menu key={category} open={!disabled && menu === category} portal side="top" align="start"
          selectedId={selected ?? (category === 'chat' && !command ? ':ordinary-chat' : undefined)}
          onClose={() => { setMenu(null) }} onSelect={(name) => { choose(name === ':ordinary-chat' ? null : name) }} items={options}
          anchor={<button type="button" className={css.entry} aria-pressed={active}
            aria-haspopup="menu" aria-expanded={!disabled && menu === category} disabled={disabled}
            onClick={() => { setMenu(menu === category ? null : category) }}>
            <Icon size={16} /><span className={css.entryLabel}>{t(`features.${category}`)}</span>
          </button>} />
      })}
    </div>
    {catalog.status === 'error' && <div className={css.hint} role="status">{t('features.error')} <button type="button" className={css.retry} onClick={loadCatalog}>{t('features.retry')}</button></div>}
    {command && <div className={css.hint}>{t('features.command')}</div>}
  </div>
}
