/** Feature selection retains authored text and recognizes only available skills. */
import { describe, expect, it } from 'vitest'
import { featureDraft, selectedFeature } from '../src/client/feature-draft.ts'

const available = ['public-ppt', 'public-report', 'custom-workflow']

describe('feature drafts', () => {
  it('selects, changes and clears a workflow without losing authored text', () => {
    expect(featureDraft('工作汇报\n依据 @"材料.md"', 'public-report', available)).toBe('/public-report 工作汇报\n依据 @"材料.md"')
    expect(featureDraft('/public-report 工作汇报', 'public-ppt', available)).toBe('/public-ppt 工作汇报')
    expect(featureDraft('/public-ppt 工作汇报', null, available)).toBe('工作汇报')
    expect(featureDraft('', 'public-report', available)).toBe('/public-report ')
  })

  it('leaves an unrelated slash command intact and refuses absent workflows', () => {
    expect(featureDraft('/plan 工作汇报', 'public-report', available)).toBeNull()
    expect(featureDraft('工作汇报', 'missing', available)).toBeNull()
    expect(featureDraft('/public-reporting 工作汇报', 'public-report', available)).toBeNull()
  })

  it('derives the current mode from the persisted draft', () => {
    expect(selectedFeature('/public-report 工作汇报', available)).toBe('public-report')
    expect(selectedFeature('/custom-workflow\n需求', available)).toBe('custom-workflow')
    expect(selectedFeature('/plan 需求', available)).toBeNull()
    expect(selectedFeature('普通对话', available)).toBeNull()
  })
})
