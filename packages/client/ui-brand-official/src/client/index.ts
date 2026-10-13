/** Official and TianCode browser brand occupants for the generic browser-brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { OfficialBrandMark, OfficialBrandName, TianCodeBrandMark, TianCodeBrandName } from './Brand.tsx'

/** Required service: the UI slot registry. */
export const inject = ['slots']

/**
 * Fill the sidebar brand slots together and the TianCode hero when declared.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  const profile = process.env.DSH_CLIENT_BUILD_PROFILE
  if (profile !== 'official' && profile !== 'tiancode') return
  const mark = profile === 'tiancode' ? TianCodeBrandMark : OfficialBrandMark
  const name = profile === 'tiancode' ? TianCodeBrandName : OfficialBrandName
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', function* () {
      yield ctx.slots.register({ name: 'sidebar.brand.mark' }, mark)
      yield ctx.slots.register({ name: 'sidebar.brand.name' }, name)
    }))
  if (profile === 'tiancode') {
    ctx.slots.inject('conversation.hero.brand.mark', function* () {
      yield ctx.slots.register({ name: 'conversation.hero.brand.mark' }, TianCodeBrandMark)
    })
  }
}
