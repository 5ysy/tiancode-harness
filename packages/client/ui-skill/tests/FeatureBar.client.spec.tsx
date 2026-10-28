// @vitest-environment jsdom
/** Business shortcut interactions preserve the current draft and catalog availability. */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeatureBar, type FeatureBarProps } from '../src/client/FeatureBar.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)

function setup(initialDraft = '', status = 'ready', locked = false, withoutParent = false) {
  const setDraft = vi.fn()
  const loadCatalog = vi.fn()
  const props = {
    t: (key: keyof typeof zh) => zh[key], locked,
    useQuickActionProviders: () => ['tiancode'],
    useQuickActions: () => ['public-ppt', 'public-report', 'public-document', 'public-minutes', 'public-summary'],
    inputActions: { setDraft }, loadCatalog,
    useFeatureCatalog: () => ({ status, skills: [
      { name: 'public-report', description: 'report', provider: 'tiancode', shortcut: { label: { zh: '编报生成', en: 'Report writing' } } },
      { name: 'public-report-topic', description: 'topic', provider: 'tiancode', shortcut: { label: { zh: '组织调研', en: 'Organization research' }, parent: 'public-report' } },
      { name: 'public-summary', description: 'summary', provider: 'tiancode' },
      { name: 'custom-workflow', description: 'custom', provider: 'tiancode' },
      { name: 'agent-only', description: 'foreign', provider: 'filesystem' },
    ].filter(skill => !withoutParent || skill.name !== 'public-report') }),
  } as FeatureBarProps
  function Harness() {
    const [draft, updateDraft] = useState(initialDraft)
    return <FeatureBar {...props} useInput={select => select({ draft, phase: 'plain' } as never)}
      inputActions={{ ...props.inputActions!, setDraft: (next) => { setDraft(next); updateDraft(next) } }} />
  }
  render(<Harness />)
  return { setDraft, loadCatalog }
}

describe('feature bar', () => {
  it('offers only installed workflows and preserves authored requirements', () => {
    const { setDraft } = setup('现有需求')
    expect(screen.getByRole('button', { name: 'public-ppt' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '编报生成' }))
    expect(setDraft).toHaveBeenCalledWith('/public-report 现有需求')
  })

  it('selects reports and opens templates only on request, without instructional text', () => {
    const { setDraft } = setup('现有需求')
    expect(screen.queryByRole('menu')).toBeNull()
    const report = screen.getByRole('button', { name: '编报生成' })
    fireEvent.click(report)
    expect(report.getAttribute('aria-expanded')).toBe('true')
    expect(setDraft).toHaveBeenCalledWith('/public-report 现有需求')
    expect(screen.getAllByRole('menuitem')).toHaveLength(1)
    expect(screen.queryByText('选择模板，添加工作区材料与编报要求；发送后生成大纲并分节编写')).toBeNull()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(report.getAttribute('aria-expanded')).toBe('false')
  })

  it('returns to chat and selects a template through the report menu', () => {
    const { setDraft } = setup('/public-report 根据材料编写')
    fireEvent.click(screen.getByRole('button', { name: '对话' }))
    expect(setDraft).toHaveBeenCalledWith('根据材料编写')
    fireEvent.click(screen.getByRole('button', { name: '编报生成' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '组织调研' }))
    expect(setDraft).toHaveBeenCalledWith('/public-report-topic 根据材料编写')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.getByRole('button', { name: '编报生成' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('discovers installed skills in More and supports Escape', () => {
    const { setDraft } = setup()
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    expect(screen.queryByRole('menuitem', { name: /agent-only/u })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: '组织调研' })).toBeNull()
    fireEvent.click(screen.getByRole('menuitem', { name: /custom-workflow/u }))
    expect(setDraft).toHaveBeenCalledWith('/custom-workflow ')
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('keeps child skills accessible when their pinned parent is removed', () => {
    setup('', 'ready', false, true)
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    expect(screen.getByRole('menuitem', { name: /组织调研/u })).toBeDefined()
  })

  it('protects unrelated commands and locked composers', () => {
    setup('/plan 当前任务')
    expect(screen.getByRole('button', { name: '编报生成' }).hasAttribute('disabled')).toBe(true)
    cleanup()
    setup('', 'ready', true)
    expect(screen.getByRole('button', { name: '编报生成' }).hasAttribute('disabled')).toBe(true)
  })

  it('retries failed catalogs and loads idle catalogs', () => {
    const { loadCatalog } = setup('', 'error')
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(loadCatalog).toHaveBeenCalledOnce()
    cleanup()
    const idle = setup('', 'idle')
    expect(idle.loadCatalog).toHaveBeenCalledOnce()
  })
})
