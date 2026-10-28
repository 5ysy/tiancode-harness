/** Composer shortcuts over the current session's user-invocable skill catalog. */
import { useEffect, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  IconNewChatOutlineRegular, IconDeliverDocRegular, IconListPenOutlineRegular,
  IconEditOutlineRegular, IconChecklistOutlineRegular, IconEllipsisOutlineRegular,
  IconSkillOutlineRegular, Menu,
} from '@deepseek-ai/dsh-client-ui-primitives'
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

const icons = [IconDeliverDocRegular, IconListPenOutlineRegular, IconEditOutlineRegular, IconChecklistOutlineRegular]

/**
 * Select a workflow by writing its visible slash invocation into the draft.
 * @param props - Composer lock, standard input actions, catalog and dictionary.
 * @returns Available workflow buttons, template choices and an installed-skills menu.
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
  const children = (name: string): readonly SkillEntry[] => skills.filter(skill => skill.shortcut?.parent === name)
    .sort((a, b) => (a.shortcut?.order ?? Number.MAX_SAFE_INTEGER)
      - (b.shortcut?.order ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
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
  const primary = quickActions.slice(0, 4)
  const more = skills.filter(skill => !primary.includes(skill.name)
    && !primary.some(name => byName.has(name) && name === skill.shortcut?.parent))
    .sort((a, b) => (a.shortcut?.order ?? Number.MAX_SAFE_INTEGER)
      - (b.shortcut?.order ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
  const active = (name: string): boolean => selected === name || byName.get(selected ?? '')?.shortcut?.parent === name
  if (quickActions.length === 0) return null
  return <div className={css.root} aria-label={t('features.label')}>
    <div className={css.row}>
      <button type="button" className={css.entry} aria-pressed={selected === null && !command} disabled={disabled} onClick={() => { choose(null) }}>
        <IconNewChatOutlineRegular size={16} />{t('features.chat')}
      </button>
      {primary.map((name, index) => {
        const Icon = icons[index] ?? IconSkillOutlineRegular
        const options = children(name)
        const button = <button key={name} type="button" className={css.entry} aria-pressed={active(name)}
          aria-haspopup={options.length > 0 ? 'menu' : undefined}
          aria-expanded={options.length > 0 ? menu === name : undefined}
          disabled={disabled || !names.includes(name)} title={names.includes(name) ? label(name) : t('features.unavailable')}
          onClick={() => {
            choose(name)
            if (options.length > 0) setMenu(menu === name ? null : name)
          }}><Icon size={16} /><span className={css.entryLabel}>{label(name)}</span></button>
        return options.length > 0
          ? <Menu key={name} open={!disabled && menu === name} portal side="top" align="start" anchor={button}
            selectedId={selected ?? undefined} onClose={() => { setMenu(null) }} onSelect={choose}
            items={options.map(skill => ({ id: skill.name, label: label(skill.name) }))} />
          : button
      })}
      <Menu open={!disabled && menu === 'more'} portal side="top" align="end" selectedId={selected ?? undefined} onClose={() => { setMenu(null) }}
        onSelect={choose} items={more.map(skill => ({ id: skill.name, label: skill.shortcut?.parent === undefined ? label(skill.name) : `${label(skill.shortcut.parent)} · ${label(skill.name)}`, icon: <IconSkillOutlineRegular size={16} /> }))}
        anchor={<button type="button" className={css.entry} aria-expanded={menu === 'more'} aria-haspopup="menu"
          disabled={disabled || more.length === 0} onClick={() => { setMenu(menu === 'more' ? null : 'more') }}><IconEllipsisOutlineRegular size={16} />{t('features.more')}</button>} />
    </div>
    {catalog.status === 'error' && <div className={css.hint} role="status">{t('features.error')} <button type="button" className={css.retry} onClick={loadCatalog}>{t('features.retry')}</button></div>}
    {command && <div className={css.hint}>{t('features.command')}</div>}
  </div>
}
