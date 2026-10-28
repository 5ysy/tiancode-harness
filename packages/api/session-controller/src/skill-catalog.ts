/** Session-addressed, cold-readable skill catalog Remote. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent-preset-registry/types'
import { SessionQueryError } from '@deepseek-ai/dsh-session-query'
import { isSkillName, isUserInvocable } from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-working-directory'
import type { ScopeKey } from '@deepseek-ai/dsh-scope'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { SkillListRequest, SkillListValue, SkillShortcut } from './types.ts'

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function shortcutMetadata(metadata: Readonly<Record<string, unknown>> | undefined, name: string): SkillShortcut | undefined {
  const value = metadata?.tiancode
  if (value === undefined) return undefined
  const invalid = (): never => { throw new Error(`skill "${name}" shortcut must contain zh/en labels, an optional skill-name parent and an integer order`) }
  if (!record(value) || Object.keys(value).some(key => !['label', 'parent', 'order'].includes(key))) return invalid()
  const label = value.label
  if (!record(label) || Object.keys(label).some(key => key !== 'zh' && key !== 'en')
    || typeof label.zh !== 'string' || label.zh.trim() === '' || typeof label.en !== 'string' || label.en.trim() === '') return invalid()
  if (value.parent !== undefined && (typeof value.parent !== 'string' || !isSkillName(value.parent) || value.parent === name)) return invalid()
  if (value.order !== undefined && (typeof value.order !== 'number' || !Number.isSafeInteger(value.order))) return invalid()
  return {
    label: { zh: label.zh, en: label.en },
    ...typeof value.parent === 'string' ? { parent: value.parent } : {},
    ...typeof value.order === 'number' ? { order: value.order } : {},
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host owner of the Session-addressed `skills` Remote namespace. */
    sessionSkillCatalog: SessionSkillCatalog
  }
}

/** Host service backing `ctx.remote.skills` without activating a cold Agent. */
export class SessionSkillCatalog extends TypertRemoteService {
  static inject = ['agents', 'sessionQuery', 'typert', 'workingDirectory']

  /** @param ctx - Host context carrying Session reads and optional skill/preset services. */
  constructor(ctx: Context) {
    super(ctx, 'sessionSkillCatalog', { namespace: 'skills' })
    ctx.on('skills/change', () => { ctx.emit('api-session/skills-changed') })
  }

  /**
   * List the user-invocable skills visible to one Session composition.
   * @param request - Session identity whose cwd and preset select the catalog view.
   * @param signal - caller lifetime carried by the Remote transport; admitted catalog reads retain their existing completion semantics.
   * @returns user-invocable skill metadata without loading skill bodies.
   * @throws RemoteError when the Session cannot be inspected or no registry can serve it.
   */
  @Remote
  async list(request: SkillListRequest, signal: AbortSignal): Promise<SkillListValue> {
    const { sessionId } = request
    let cwd: string
    let agentPreset: string | undefined
    try {
      using observation = await this.ctx.sessionQuery.observeSession(sessionId)
      if (observation.projections === undefined) {
        throw new Error('skill catalog requires a projected Session observation')
      }
      cwd = observation.projections.values.workingDirectory
        ?? observation.header.cwd
        ?? this.ctx.workingDirectory.defaultDirectory
      agentPreset = observation.projections.values.agentPreset ?? undefined
      const live = this.ctx.agents.get(sessionId)
      if (live !== undefined) cwd = await this.ctx.workingDirectory.ensure(live, signal)
    } catch (error: unknown) {
      if (error instanceof SessionQueryError
        && error.code === 'SESSION_QUERY_SESSION_NOT_FOUND') {
        throw new RemoteError('session/not-found', `session "${sessionId}" not found`, { sessionId })
      }
      throw new RemoteError(
        'gateway/internal',
        `session "${sessionId}" could not be inspected: ${String(error)}`,
        {},
      )
    }

    const live = this.ctx.agents.get(sessionId)
    const presets = this.ctx.get('agentPresets')
    const scoped = live === undefined ? undefined : presets?.serviceFor(live, 'skills')
    const skillRegistry = scoped ?? this.ctx.get('skills')
    if (skillRegistry === undefined) {
      throw new RemoteError(
        'gateway/internal',
        'skill registry is absent: neither this session\'s agent preset nor the host composition mounts @deepseek-ai/dsh-skill',
        {},
      )
    }

    await using lease = live === undefined ? await this.scopeFor(agentPreset) : undefined
    const scope = live ?? lease?.key
    try {
      const skills = (await skillRegistry.list({ cwd, scope })).filter(isUserInvocable)
      return {
        skills: skills.map((skill) => {
          const shortcut = shortcutMetadata(skill.metadata, skill.name)
          return {
            ...Object.hasOwn(skill, 'provider') ? { provider: skill.provider } : {},
            ...shortcut === undefined ? {} : { shortcut },
            name: skill.name,
            ...skill.path === undefined ? {} : { path: skill.path },
            description: skill.description,
            ...skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse },
            modelInvocable: skill.invocation.modelInvocable,
          }
        }),
      }
    } catch (error: unknown) {
      throw new RemoteError('gateway/internal', `skill listing failed: ${String(error)}`, {})
    }
  }

  /** Resolve a live or standing preset scope without creating an Agent. */
  private async scopeFor(
    agentPreset: string | undefined,
  ): Promise<({ key: ScopeKey } & AsyncDisposable) | undefined> {
    const presets = this.ctx.get('agentPresets')
    if (presets === undefined) return undefined
    try {
      return await presets.acquireScope(agentPreset)
    } catch {
      // An unknown or unusable recorded preset falls back to the global registry.
      return undefined
    }
  }
}

export default SessionSkillCatalog
