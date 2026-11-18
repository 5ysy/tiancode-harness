import { describe, expect, it } from 'vitest'
import { SkillHubController } from '../src/client/controller.ts'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'

function fixture() {
  const snapshot: ConfigFormSnapshot<{ catalogUrl: string }> = { status: 'ready', value: { catalogUrl: 'https://internal/catalog.json' }, base: {}, user: {}, revision: 1, writable: true }
  const form: ConfigForm<{ catalogUrl: string }> = { getSnapshot: () => snapshot, subscribe: () => () => {},
    mutate: async () => true, set: async () => true, unset: async () => true }
  const catalog = { version: 1, skills: [{ id: 'writer', name: 'writer', title: 'Writer', description: 'Write', package: 'packages/writer.json', sha256: 'a'.repeat(64) }], installed: [] }
  return { form, catalog }
}

describe('Skill Hub page operations', () => {
  it('retains cards after refresh and install failures', async () => {
    const { form, catalog } = fixture()
    let fail = false
    const controller = new SkillHubController(form, async () => new Response(JSON.stringify(fail ? { error: { code: 'unreachable' } } : catalog), { status: fail ? 502 : 200 }))
    await controller.load()
    expect(controller.getSnapshot().catalog?.skills).toHaveLength(1)
    fail = true
    await controller.load()
    expect(controller.getSnapshot().catalog?.skills).toHaveLength(1)
    expect(controller.getSnapshot().error).toBe('unreachable')
    await controller.install({ skillId: 'writer', metadata: { category: 'document', label: { zh: '写作', en: 'Writer' } } })
    expect(controller.getSnapshot().catalog?.skills).toHaveLength(1)
    expect(controller.getSnapshot().error).toBe('unreachable')
    controller.dispose()
  })
  it('contains rejected settings writes and never requests the catalog after refusal', async () => {
    const { form } = fixture()
    let calls = 0
    form.mutate = () => Promise.reject(new Error('offline'))
    const controller = new SkillHubController(form, async () => { calls++; throw new Error('unexpected') })
    await controller.save('https://internal/catalog.json')
    expect(controller.getSnapshot().error).toBe('save-failed')
    expect(calls).toBe(0)
    controller.dispose()
  })
  it('ignores responses after disposal and aborts pending reads', async () => {
    const { form, catalog } = fixture()
    let settle!: (response: Response) => void
    let signal: AbortSignal | null | undefined
    const controller = new SkillHubController(form, (_url, init) => {
      signal = init?.signal
      return new Promise((resolve) => { settle = resolve })
    })
    const pending = controller.load()
    controller.dispose()
    expect(signal?.aborted).toBe(true)
    settle(new Response(JSON.stringify(catalog)))
    await pending
    expect(controller.getSnapshot().catalog).toBeUndefined()
  })
})
