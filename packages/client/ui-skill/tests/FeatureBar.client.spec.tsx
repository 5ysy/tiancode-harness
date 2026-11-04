// @vitest-environment jsdom
/** Composer categories preserve drafts while discovering every available workflow. */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import { FeatureBar, type FeatureBarProps } from '../src/client/FeatureBar.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)

const categories = ['对话', 'PPT汇报', '公文写作', '编报生成', '数据分析', '执法办案', '格式校对', '其他']
const skills: SkillEntry[] = [
  { name: 'public-report', description: 'report', provider: 'tiancode', modelInvocable: true, shortcut: { label: { zh: '编报生成', en: 'Report writing' } } },
  { name: 'public-report-topic', description: 'topic', provider: 'tiancode', modelInvocable: true, shortcut: { label: { zh: '组织调研', en: 'Organization research' }, parent: 'public-report' } },
  { name: 'public-summary', description: 'summary', provider: 'tiancode', modelInvocable: true },
  { name: 'constructor', description: 'custom constructor workflow', provider: 'tiancode', modelInvocable: true },
  { name: 'custom-workflow', description: 'custom', provider: 'tiancode', modelInvocable: true },
  { name: 'agent-only', description: 'foreign', provider: 'filesystem', modelInvocable: true },
]

function setup(options: {
  draft?: string
  status?: string
  locked?: boolean
  skills?: SkillEntry[]
  actions?: string[]
  phase?: string
} = {}) {
  const setDraft = vi.fn()
  const loadCatalog = vi.fn()
  let entries = options.skills ?? skills
  const props = {
    t: (key: keyof typeof zh) => zh[key], locked: options.locked ?? false,
    useQuickActionProviders: () => ['tiancode'],
    useQuickActions: () => options.actions ?? ['public-report'],
    inputActions: { setDraft }, loadCatalog,
    useFeatureCatalog: () => ({ status: options.status ?? 'ready', skills: entries }),
  } as FeatureBarProps
  function Harness() {
    const [draft, updateDraft] = useState(options.draft ?? '')
    return <FeatureBar {...props} useInput={select => select({ draft, phase: options.phase ?? 'plain' } as never)}
      inputActions={{ ...props.inputActions!, setDraft: (next) => { setDraft(next); updateDraft(next) } }} />
  }
  const view = render(<Harness />)
  return { setDraft, loadCatalog, changeSkills: (next: SkillEntry[]) => { entries = next; view.rerender(<Harness />) } }
}

describe('feature bar categories', () => {
  it('shows all eight categories in product order and opens each without editing the draft', () => {
    const { setDraft } = setup({ draft: '现有需求' })
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(categories)
    for (const name of categories) {
      fireEvent.click(screen.getByRole('button', { name }))
      expect(screen.getByRole('menu')).toBeDefined()
      expect(setDraft).not.toHaveBeenCalled()
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
      expect(screen.queryByRole('menu')).toBeNull()
    }
  })

  it('selects root and inherited child skills through a category while preserving authored text', () => {
    const { setDraft } = setup({ draft: '现有需求\n依据 @"材料.md"' })
    fireEvent.click(screen.getByRole('button', { name: '编报生成' }))
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
    fireEvent.click(screen.getByRole('menuitem', { name: '编报生成' }))
    expect(setDraft).toHaveBeenLastCalledWith('/public-report 现有需求\n依据 @"材料.md"')
    fireEvent.click(screen.getByRole('button', { name: '编报生成' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /组织调研/u }))
    expect(setDraft).toHaveBeenLastCalledWith('/public-report-topic 现有需求\n依据 @"材料.md"')
    expect(screen.getByRole('button', { name: '编报生成' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('offers ordinary chat as a menu choice that removes only the selected skill prefix', () => {
    const { setDraft } = setup({ draft: '/public-report 根据材料编写' })
    fireEvent.click(screen.getByRole('button', { name: '对话' }))
    expect(setDraft).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('menuitem', { name: '普通对话' }))
    expect(setDraft).toHaveBeenCalledWith('根据材料编写')
  })

  it('selects a custom chat skill whose name matches the ordinary chat choice', () => {
    const { setDraft } = setup({ skills: [{ name: 'ordinary-chat', description: 'custom chat', provider: 'tiancode', modelInvocable: true,
      shortcut: { label: { zh: '定制对话', en: 'Custom chat' }, category: 'chat' } }] })
    fireEvent.click(screen.getByRole('button', { name: '对话' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '定制对话' }))
    expect(setDraft).toHaveBeenCalledWith('/ordinary-chat ')
  })

  it('keeps unclassified and orphan skills in Other and respects provider filtering', () => {
    setup({ skills: skills.filter(skill => skill.name !== 'public-report') })
    fireEvent.click(screen.getByRole('button', { name: '其他' }))
    expect(screen.getByRole('menuitem', { name: 'custom-workflow' })).toBeDefined()
    expect(screen.getByRole('menuitem', { name: 'constructor' })).toBeDefined()
    expect(screen.getByRole('menuitem', { name: /组织调研/u })).toBeDefined()
    expect(screen.queryByRole('menuitem', { name: /agent-only/u })).toBeNull()
  })

  it.each([
    ['PPT汇报', ['public-ppt', 'public-ppt-business', 'public-ppt-internet', 'public-ppt-police']],
    ['公文写作', ['public-document', 'public-minutes', 'public-summary', 'public-plan', 'public-speech', 'public-collaborative-writing', 'public-internal-comms']],
    ['编报生成', ['public-report', 'public-report-annual', 'public-report-country-brief', 'public-report-country-hotspot', 'public-report-country-monthly', 'public-report-email', 'public-report-event', 'public-report-organization-brief', 'public-report-organization-monthly', 'public-report-organization-research']],
    ['数据分析', ['public-ledger']], ['执法办案', ['public-policy-research']],
    ['格式校对', ['public-proofread', 'public-document-format']], ['其他', ['public-pdf']],
  ])('classifies existing bundled files without category metadata in %s', (category, names) => {
    setup({ skills: names.map(name => ({ name, provider: 'tiancode', description: name, modelInvocable: true })) })
    fireEvent.click(screen.getByRole('button', { name: category }))
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('uses explicit metadata before inherited and built-in categories, including parent cycles', () => {
    const entries: SkillEntry[] = [
      { name: 'public-report', provider: 'tiancode', description: 'customized', modelInvocable: true,
        shortcut: { label: { zh: '自定义编报', en: 'Custom report' }, category: 'data' } },
      { name: 'public-report-email', provider: 'tiancode', description: 'inherited', modelInvocable: true,
        shortcut: { label: { zh: '继承分类', en: 'Inherited category' }, parent: 'public-report' } },
      { name: 'cycle-a', provider: 'tiancode', description: 'cycle', modelInvocable: true,
        shortcut: { label: { zh: '循环甲', en: 'Cycle A' }, parent: 'cycle-b' } },
      { name: 'cycle-b', provider: 'tiancode', description: 'cycle', modelInvocable: true,
        shortcut: { label: { zh: '循环乙', en: 'Cycle B' }, parent: 'cycle-a' } },
    ]
    setup({ skills: entries })
    fireEvent.click(screen.getByRole('button', { name: '数据分析' }))
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: '其他' }))
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
  })

  it('prioritizes configured workflows within their category before author order', () => {
    const entries: SkillEntry[] = ['custom-a', 'custom-b', 'custom-c'].map((name, order) => ({ name, provider: 'tiancode',
      description: name, modelInvocable: true, shortcut: { label: { zh: name, en: name }, category: 'data', order } }))
    setup({ skills: entries, actions: ['custom-c', 'custom-a'] })
    fireEvent.click(screen.getByRole('button', { name: '数据分析' }))
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual(['custom-c', 'custom-a', 'custom-b'])
  })

  it('keeps empty categories expandable with a disabled localized item', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '执法办案' }))
    expect(screen.getByRole('menuitem', { name: '暂无可用技能' }).hasAttribute('disabled')).toBe(true)
  })

  it('updates category choices when the catalog changes during an open menu', () => {
    const custom: SkillEntry = { name: 'custom-law', description: 'custom', provider: 'tiancode', modelInvocable: true,
      shortcut: { label: { zh: '自定义技能', en: 'Custom skill' }, category: 'law' } }
    const { changeSkills } = setup()
    fireEvent.click(screen.getByRole('button', { name: '执法办案' }))
    changeSkills([...skills, custom])
    expect(screen.getByRole('menuitem', { name: '自定义技能' })).toBeDefined()
    changeSkills([...skills, { ...custom, shortcut: { ...custom.shortcut!, category: 'data' } }])
    expect(screen.queryByRole('menuitem', { name: '自定义技能' })).toBeNull()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: '数据分析' }))
    expect(screen.getByRole('menuitem', { name: '自定义技能' })).toBeDefined()
    changeSkills(skills)
    expect(screen.queryByRole('menuitem', { name: '自定义技能' })).toBeNull()
  })

  it.each([{ draft: '/plan 当前任务' }, { locked: true }, { phase: 'command' }])('protects commands and locked composers %j', (options) => {
    setup(options)
    expect(screen.getAllByRole('button').every(button => button.hasAttribute('disabled'))).toBe(true)
  })

  it('hides the feature bar when quick actions are disabled', () => {
    setup({ actions: [] })
    expect(screen.queryByLabelText('办公助手')).toBeNull()
  })

  it('retries failed catalogs and loads idle catalogs', () => {
    const { loadCatalog } = setup({ status: 'error' })
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(loadCatalog).toHaveBeenCalledOnce()
    cleanup()
    expect(setup({ status: 'idle' }).loadCatalog).toHaveBeenCalledOnce()
  })
})
