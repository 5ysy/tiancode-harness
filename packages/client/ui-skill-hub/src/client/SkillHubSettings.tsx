/** Card catalog and metadata editor rendered in Settings. */
import { useEffect, useState, type ReactNode } from 'react'
import { Button, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SkillHubEntry, SkillHubInstallRequest, TianCodeMetadata } from '@deepseek-ai/dsh-skill-hub/types'
import type { SkillHubSettingsInjected } from './controller.ts'
import type { SkillHubLocaleKey } from './locales.ts'
import css from './SkillHubSettings.module.css'

/** Slot-derived data, locale, and page actions. */
export type SkillHubSettingsProps = PropsRuntime<'settings.section'> & PropsLocale<'settings.skillHub'> & InjectFace<SkillHubSettingsInjected> & SettingsSectionOwnerProps
const categoryIds = ['chat', 'ppt', 'document', 'report', 'data', 'law', 'proofread', 'other'] as const
const failures = new Set(['not-configured', 'invalid-url', 'invalid-data', 'unreachable', 'upstream-failed', 'missing-token', 'conflict', 'busy', 'invalid-parent', 'cancelled', 'save-failed'])

/**
 * Render the server connection, searchable cards, and installation form.
 * @param props - bound page hooks, actions, and localized text.
 * @returns Skill Hub settings content.
 */
export function SkillHubSettings({ useHub, load, save, install, t }: SkillHubSettingsProps): ReactNode {
  const state = useHub(value => value)
  const [url, setUrl] = useState('')
  const [dirty, setDirty] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const savedUrl = state.form.value?.catalogUrl ?? ''
  useEffect(() => { if (!dirty) setUrl(savedUrl) }, [savedUrl, dirty])
  useEffect(() => { void load() }, [load, savedUrl, state.form.status])
  const busy = state.busy !== null
  const entries = state.catalog?.skills ?? []
  const matches = entries.filter(entry => `${entry.title} ${entry.name} ${entry.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const errorKey: SkillHubLocaleKey = `error.${failures.has(state.error ?? '') ? state.error : 'operation-failed'}` as SkillHubLocaleKey
  return <section className={css.section} aria-label={t('title')}>
    <p className={css.intro}>{t('subtitle')}</p>
    <form className={css.connection} onSubmit={(event) => { event.preventDefault(); void save(url) }}>
      <label className={css.field}><span>{t('catalogUrl')}</span><input type="url" required value={url} placeholder={t('catalogUrlPlaceholder')} disabled={busy || !state.form.writable} onChange={(event) => { setDirty(true); setUrl(event.target.value) }} /></label>
      <Button variant="primary" type="submit" disabled={busy || !state.form.writable}>{t('save')}</Button>
    </form>
    <p className={css.intro}>{t('locationHint')}</p>
    {state.form.status === 'unavailable' && <p role="status">{t('unavailable')}</p>}
    {state.error !== undefined && <p role="alert" className={css.error}>{t(errorKey)}</p>}
    {state.notice !== undefined && <p role="status" className={css.status}>{t(state.notice === 'installed' ? 'installSuccess' : 'saved')}</p>}
    <div className={css.toolbar}>
      <input type="search" aria-label={t('search')} placeholder={t('search')} value={query} onChange={(event) => { setQuery(event.target.value) }} />
      <Button variant="outline" onClick={() => { void load() }} disabled={busy || savedUrl === ''}>{t('refresh')}</Button>
    </div>
    {state.busy === 'load' && <p role="status" className={css.status}>{t('loading')}</p>}
    {savedUrl === '' && <p className={css.status}>{t('configure')}</p>}
    {state.catalog !== undefined && matches.length === 0 && <p className={css.status}>{t(entries.length === 0 ? 'empty' : 'noResults')}</p>}
    <ul className={css.cards}>
      {matches.map((entry) => {
        const installed = state.catalog?.installed.includes(entry.id) === true
        return <li key={entry.id} className={css.card}>
          <div className={css.cardHeader}><h3>{entry.title}</h3>{installed && <span className={css.badge}>{t('installed')}</span>}</div>
          <span className={css.identity}>{entry.name}{entry.author === undefined ? '' : ` · ${entry.author}`}</span>
          <p>{entry.description}</p>
          {selected === entry.id && !installed
            ? <InstallForm key={entry.id} entry={entry} t={t} busy={busy} install={install} cancel={() => { setSelected(null) }} />
            : <Button variant="outline" disabled={busy || installed} onClick={() => { setSelected(entry.id) }}>{t(installed ? 'installed' : 'install')}</Button>}
        </li>
      })}
    </ul>
  </section>
}

interface InstallFormProps {
  readonly entry: SkillHubEntry
  readonly t: SkillHubSettingsProps['t']
  readonly busy: boolean
  readonly install: (request: SkillHubInstallRequest) => Promise<void>
  readonly cancel: () => void
}

function InstallForm({ entry, t, busy, install, cancel }: InstallFormProps): ReactNode {
  const [category, setCategory] = useState<TianCodeMetadata['category']>('other')
  const [menu, setMenu] = useState(false)
  const [zh, setZh] = useState(entry.title)
  const [en, setEn] = useState(entry.name)
  const [parent, setParent] = useState('')
  const [order, setOrder] = useState('')
  return <form className={css.installForm} onSubmit={(event) => {
    event.preventDefault()
    void install({ skillId: entry.id, metadata: { category, label: { zh: zh.trim(), en: en.trim() },
      ...parent.trim() === '' ? {} : { parent: parent.trim() }, ...order === '' ? {} : { order: Number(order) } } })
  }}>
    <div className={css.field}><span>{t('category')}</span><Menu open={menu} portal selectedId={category}
      onClose={() => { setMenu(false) }} onSelect={(id) => {
        const next = categoryIds.find(value => value === id)
        if (next !== undefined) setCategory(next)
        setMenu(false)
      }}
      items={categoryIds.map(id => ({ id, label: t(`category.${id}`) }))}
      anchor={<Button variant="outline" disabled={busy} aria-label={t('category')} aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu(!menu) }}>{t(`category.${category}`)}</Button>} /></div>
    <label className={css.field}><span>{t('labelZh')}</span><input required maxLength={200} value={zh} disabled={busy} onChange={(event) => { setZh(event.target.value) }} /></label>
    <label className={css.field}><span>{t('labelEn')}</span><input required maxLength={200} value={en} disabled={busy} onChange={(event) => { setEn(event.target.value) }} /></label>
    <details><summary>{t('advanced')}</summary><div className={css.advanced}>
      <p>{t('metadataHint')}</p>
      <label className={css.field}><span>{t('parent')}</span><input maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={parent} disabled={busy} onChange={(event) => { setParent(event.target.value) }} /></label>
      <label className={css.field}><span>{t('order')}</span><input type="number" step="1" min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} value={order} disabled={busy} onChange={(event) => { setOrder(event.target.value) }} /></label>
    </div></details>
    <div className={css.installActions}><Button onClick={cancel} disabled={busy}>{t('cancel')}</Button><Button type="submit" variant="primary" disabled={busy || zh.trim() === '' || en.trim() === ''}>{t(busy ? 'installing' : 'install')}</Button></div>
  </form>
}
