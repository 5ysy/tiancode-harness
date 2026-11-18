/** Settings and HTTP operation ownership for the Skill Hub page. */
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type { SkillHubCatalog, SkillHubInstallRequest } from '@deepseek-ai/dsh-skill-hub/types'

/** Settings fields edited by this page. */
export interface HubSettings { readonly catalogUrl: string }

/** Immutable page publication; query failures retain the accepted catalog. */
export interface HubState {
  readonly form: ConfigFormSnapshot<HubSettings>
  readonly catalog?: SkillHubCatalog
  readonly busy: 'load' | 'save' | 'install' | null
  readonly error?: string | undefined
  readonly notice?: 'saved' | 'installed' | undefined
}

/** Registration-owned data and actions, adapted into hooks by the slot renderer. */
export interface SkillHubSettingsInjected {
  readonly hooks: { readonly hub: HostObservable<HubState> }
  readonly load: () => Promise<void>
  readonly save: (url: string) => Promise<void>
  readonly install: (request: SkillHubInstallRequest) => Promise<void>
}

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>

/** Owns configuration observation, request cancellation, and stale-result fencing. */
export class SkillHubController implements HostObservable<HubState> {
  private state: HubState
  private readonly listeners = new Set<() => void>()
  private readonly unsubscribe: () => void
  private request: AbortController | undefined
  private disposed = false
  private sequence = 0

  /**
   * @param form - shared Host configuration form.
   * @param send - HTTP carrier; injectable for isolated tests.
   */
  constructor(
    private readonly form: ConfigForm<HubSettings>,
    private readonly send: Fetcher = (url, init) => fetch(resolveApiUrl(url), init),
  ) {
    this.state = { form: form.getSnapshot(), busy: null }
    this.unsubscribe = form.subscribe(() => {
      const previous = this.state.form.value?.catalogUrl
      this.update({ ...this.state, form: form.getSnapshot() })
      if (previous !== this.state.form.value?.catalogUrl) {
        this.request?.abort()
        this.sequence++
        this.update({ form: this.state.form, busy: this.state.busy === 'save' ? 'save' : null })
      }
    })
  }

  /** @returns last immutable page state. */
  getSnapshot = (): HubState => this.state

  /**
   * @param listener - invoked after publication.
   * @returns subscription disposer.
   */
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  /** Build the slot data face.
   * @returns slot injection with stable operations.
   */
  inject(): SkillHubSettingsInjected { return { hooks: { hub: this }, load: this.load, save: this.save, install: this.install } }

  /** Read the configured server, retaining the accepted cards on failure. */
  load = async (): Promise<void> => {
    if (this.disposed || this.state.busy !== null || this.state.form.status !== 'ready' || !this.state.form.value?.catalogUrl.trim()) return
    const { sequence, signal } = this.start('load')
    try {
      const catalog = parseCatalog(await this.json('catalog', { signal }))
      if (this.current(sequence)) this.update({ ...this.state, catalog, busy: null })
    } catch (error) { this.failed(sequence, error) }
  }

  /**
   * Save one validated server URL; refused writes keep the user's input in the page.
   * @param url - absolute internal catalog URL.
   */
  save = async (url: string): Promise<void> => {
    if (this.disposed || this.state.busy !== null) return
    try {
      const parsed = new URL(url.trim())
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('invalid-url')
    } catch { this.update({ ...this.state, error: 'invalid-url' }); return }
    this.update({ ...this.state, busy: 'save', error: undefined, notice: undefined })
    try {
      const accepted = await this.form.mutate([{ op: 'set', path: ['catalogUrl'], value: url.trim() }])
      if (this.active()) {
        this.update({ ...this.state, busy: null, ...(accepted ? { notice: 'saved' } : { error: 'save-failed' }) })
        if (accepted) await this.load()
      }
    } catch { if (this.active()) this.update({ ...this.state, busy: null, error: 'save-failed' }) }
  }

  /**
   * Install a selected catalog entry and publish its local state after Host acknowledgement.
   * @param request - exact TianCode metadata and catalog skill id.
   */
  install = async (request: SkillHubInstallRequest): Promise<void> => {
    if (this.disposed || this.state.busy !== null) return
    const { sequence, signal } = this.start('install')
    try {
      const result = await this.json('install', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal })
      if (!record(result) || result.installed !== true) throw new Error('invalid-data')
      if (this.current(sequence)) {
        const catalog = this.state.catalog
        this.update({ ...this.state, busy: null, notice: 'installed', ...catalog === undefined ? {} : { catalog: { ...catalog, installed: [...catalog.installed, request.skillId] } } })
      }
    } catch (error) { this.failed(sequence, error) }
  }

  /** Cancel requests and release configuration observation on plugin removal. */
  dispose(): void { this.disposed = true; this.sequence++; this.request?.abort(); this.unsubscribe(); this.listeners.clear() }

  private start(busy: HubState['busy']): { sequence: number; signal: AbortSignal } {
    this.request?.abort()
    this.request = new AbortController()
    const sequence = ++this.sequence
    this.update({ ...this.state, busy, error: undefined, notice: undefined })
    return { sequence, signal: this.request.signal }
  }

  private active(): boolean { return !this.disposed }
  private current(sequence: number): boolean { return !this.disposed && sequence === this.sequence }
  private update(state: HubState): void { if (this.disposed) return; this.state = state; for (const listener of this.listeners) listener() }
  private failed(sequence: number, error: unknown): void {
    if (this.current(sequence)) this.update({ ...this.state, busy: null, error: error instanceof Error ? error.message : 'operation-failed' })
  }

  private async json(endpoint: string, init: RequestInit): Promise<unknown> {
    const response = await this.send(`/api/skill-hub/${endpoint}`, init)
    const value: unknown = await response.json()
    if (!response.ok) throw new Error(record(value) && record(value.error) && typeof value.error.code === 'string' ? value.error.code : 'operation-failed')
    return value
  }
}

function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }

function parseCatalog(value: unknown): SkillHubCatalog {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.skills) || !Array.isArray(value.installed) || value.installed.some(id => typeof id !== 'string')) throw new Error('invalid-data')
  const skills = value.skills.map((entry: unknown) => {
    if (!record(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.title !== 'string'
      || typeof entry.description !== 'string' || typeof entry.package !== 'string' || typeof entry.sha256 !== 'string'
      || (entry.author !== undefined && typeof entry.author !== 'string') || (entry.repository !== undefined && typeof entry.repository !== 'string')) throw new Error('invalid-data')
    return { id: entry.id, name: entry.name, title: entry.title, description: entry.description,
      package: entry.package, sha256: entry.sha256,
      ...typeof entry.author === 'string' ? { author: entry.author } : {}, ...typeof entry.repository === 'string' ? { repository: entry.repository } : {} }
  })
  return { version: 1, skills, installed: value.installed.filter((id): id is string => typeof id === 'string') }
}

/**
 * Resolve Host endpoints under the page's mount, adapted from dsh-skills-manager/api-base.ts.
 * @param path - absolute plugin route.
 * @returns document-relative URL preserving reverse-proxy path prefixes.
 */
export function resolveApiUrl(path: string): string {
  if (typeof document === 'undefined') return path.slice(1)
  const base = new URL(document.baseURI)
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  return new URL(path.replace(/^\//, ''), base).href
}
