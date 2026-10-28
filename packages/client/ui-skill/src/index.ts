/** Host configuration for skill references and optional composer workflow shortcuts. */
import type { Context, Volatile } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** Composer shortcut configuration forwarded to the browser plugin. */
export interface Config {
  /** Ordered skill names; empty or omitted hides the shortcut bar. */
  quickActions: Volatile<string[]>
  /** Allowed shortcut providers; empty includes every provider. */
  quickActionProviders: Volatile<string[]>
}

/** Validate skill names before publishing the client configuration. */
export const Config = z.object({
  quickActionProviders: z.array(z.string().min(1)).default([]).volatile(),
  quickActions: z.array(z.string().pattern(/^[a-z0-9][a-z0-9-]*$/u)).default([]).volatile(),
})

/** Host preferences are consumed through the configuration form projection.
 * @param ctx - Plugin context used for optional settings presentation.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (child) => { child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)) })
}
