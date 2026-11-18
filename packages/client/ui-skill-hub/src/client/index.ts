/** Skill Hub dictionaries and Settings navigation contribution. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { SkillHubSettings } from './SkillHubSettings.tsx'
import { SkillHubController, type HubSettings } from './controller.ts'
import { en, zh, type SkillHubLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Skill Hub settings dictionary. */
    'settings.skillHub': SkillHubLocaleKey
  }
}

/** Client services used by this plugin. */
export const inject = ['slots', 'locale', 'configForms']

/**
 * Mount the left Settings entry while its Host configuration is served.
 * @param ctx - Client plugin scope.
 */
export function apply(ctx: Context): void {
  const namespace = 'settings.skillHub'
  const t = ctx.locale.bind(namespace)
  ctx.effect(() => ctx.locale.register(namespace, { zh, en }), 'ui-skill-hub: locale')
  const controller = new SkillHubController(ctx.configForms.get<HubSettings>('skill-hub'))
  ctx.effect(() => () => { controller.dispose() }, 'ui-skill-hub: controller')
  ctx.effect(() => ctx.configForms.whileServed(['skill-hub'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'skill-hub', order: 35, label: () => t('title'), locale: namespace, inject: () => controller.inject(),
  }, SkillHubSettings))), 'ui-skill-hub: page')
}
