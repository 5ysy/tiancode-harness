// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-test-runtime'
import type {} from '../src/client/index.ts'
import type { HubState } from '../src/client/controller.ts'
import { SkillHubSettings, type SkillHubSettingsProps } from '../src/client/SkillHubSettings.tsx'
import { zh, type SkillHubLocaleKey } from '../src/client/locales.ts'

afterEach(cleanup)
function mounted() {
  let state: HubState = { form: { status: 'ready', value: { catalogUrl: 'http://internal/catalog.json' }, base: {}, user: {}, revision: 1, writable: true },
    busy: null, catalog: { version: 1, skills: [{ id: 'writer', name: 'writer', title: '文档助手', description: 'Read references/style.md', package: 'packages/writer.json', sha256: 'a'.repeat(64) }], installed: [] } }
  const listeners = new Set<() => void>()
  const store = { getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) } }
  const install = vi.fn(async () => {})
  const props = { close: () => {}, useHub: bindSnapshotSelector(store), load: vi.fn(async () => {}),
    save: vi.fn(async () => {}), install,
    t: ((key: SkillHubLocaleKey) => zh[key]) as SkillHubSettingsProps['t'] } as SkillHubSettingsProps
  const view = render(<SkillHubSettings {...props} />)
  return { install, view, set: (next: Partial<HubState>) => {
    act(() => { state = { ...state, ...next }; for (const listener of listeners) listener() })
  } }
}

describe('Skill Hub Settings page', () => {
  it('submits the selected TianCode category and labels and retains edits after failure', () => {
    const { install, set } = mounted()
    fireEvent.click(screen.getByRole('button', { name: zh.install }))
    fireEvent.click(screen.getByRole('button', { name: zh.category }))
    fireEvent.click(screen.getByRole('menuitem', { name: zh['category.document'] }))
    fireEvent.change(screen.getByLabelText(zh.labelEn), { target: { value: 'Document assistant' } })
    fireEvent.click(screen.getByRole('button', { name: zh.install }))
    expect(install).toHaveBeenCalledWith({ skillId: 'writer', metadata: { category: 'document', label: { zh: '文档助手', en: 'Document assistant' } } })
    set({ error: 'unreachable' })
    expect(screen.getByRole('alert').textContent).toBe(zh['error.unreachable'])
    expect(screen.getByLabelText<HTMLInputElement>(zh.labelEn).value).toBe('Document assistant')
    expect(screen.getByRole('heading', { name: '文档助手' })).toBeTruthy()
  })
  it('filters cards and renders localized empty results', () => {
    mounted()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } })
    expect(screen.queryByRole('heading', { name: '文档助手' })).toBeNull()
    expect(screen.getByText(zh.noResults)).toBeTruthy()
  })
  it('records the installed card presentation', () => {
    const { set, view } = mounted()
    set({ catalog: { version: 1, skills: [{ id: 'writer', name: 'writer', title: '文档助手', description: 'Read references/style.md', package: 'packages/writer.json', sha256: 'a'.repeat(64) }], installed: ['writer'] }, notice: 'installed' })
    expect(view.container.innerHTML).toMatchSnapshot()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: zh.installed }).disabled).toBe(true)
  })
})
