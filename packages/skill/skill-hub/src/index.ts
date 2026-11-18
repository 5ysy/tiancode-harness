/** TianCode Skill Hub authenticated catalog routes and local skill provider. */
import { lstat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Context, type Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-client-connection'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'
import { parseSkillHubIndex, record, validateInstallSelection, type SkillHubIndex } from './catalog.ts'
import { installPackage, readBounded } from './installer.ts'

export type { SkillHubCatalog, SkillHubEntry, SkillHubIndex, SkillHubInstallRequest, TianCodeMetadata } from './types.ts'

/** Loader plugin identifier. */
export const name = 'skill-hub'
/** Required Host services; files are installed on this Host. */
export const inject = ['connection', 'skills']

/** Deployment settings; changing installRoot remounts the provider. */
export interface Config {
  /** HTTP(S) URL of the private static catalog; editable without remounting. */
  catalogUrl: Volatile<string>
  /** Plugin-owned directory on the current Host receiving installed skills. */
  installRoot: string
  /** Maximum wire response and aggregate decoded package bytes. */
  maxBytes: number
  /** Maximum file entries accepted per skill package. */
  maxFiles: number
  /** Maximum milliseconds for one complete catalog or install operation. */
  fetchTimeoutMs: number
  /** Optional environment variable containing the private server bearer token. */
  tokenEnv: string
}

/** Validated deployment configuration exposed through Settings. */
export const Config = z.object({
  catalogUrl: z.string().default('').volatile(),
  installRoot: z.string().min(1).default(dshHomePath('skill-hub', 'skills')),
  maxBytes: z.natural().min(1024).max(64 * 1024 * 1024).default(16 * 1024 * 1024),
  maxFiles: z.natural().min(1).max(5000).default(1000),
  fetchTimeoutMs: z.natural().min(1000).max(300000).default(30000),
  tokenEnv: z.string().default(''),
})

/**
 * Mount the private catalog and directory-preserving installer.
 * @param ctx - plugin-scoped Host context.
 * @param config - schema-resolved connection and package limits.
 */
export function apply(ctx: Context, config: Config): void {
  const root = resolve(config.installRoot)
  let provider: FileSystemSkillProvider
  let invalidate = (): void => {}
  ctx.skills.registerProvider((control) => {
    invalidate = control.invalidate
    provider = new FileSystemSkillProvider(ctx, control, { providerName: 'skill-hub', includeDefaultRoots: false, customSkillDirs: [root] })
    return provider
  })
  ctx.effect(() => () => provider.dispose(), 'skill-hub: filesystem provider')
  ctx.effect(() => {
    const lifetime = new AbortController()
    const pending = new Set<Promise<Response>>()
    let installing = false
    function route(request: Request, operation: (signal: AbortSignal) => Promise<object>): Promise<Response> {
      const signal = AbortSignal.any([request.signal, lifetime.signal, AbortSignal.timeout(config.fetchTimeoutMs)])
      const task = (async () => {
        try { return json(await operation(signal)) } catch (error) {
          if (error instanceof HubError) return json({ error: { code: error.code } }, error.status)
          if (error instanceof TypeError || error instanceof SyntaxError || error instanceof RangeError) return json({ error: { code: 'invalid-data' } }, 400)
          if (signal.aborted) return json({ error: { code: 'cancelled' } }, 408)
          ctx.logger.warn('Skill Hub %s %s failed (%s)', request.method, new URL(request.url).pathname, record(error) && typeof error.code === 'string' ? error.code : error instanceof Error ? error.name : 'unknown')
          return json({ error: { code: 'operation-failed' } }, 500)
        }
      })()
      pending.add(task)
      void task.finally(() => pending.delete(task))
      return task
    }
    const catalog = ctx.connection.fetch.register({ path: '/api/skill-hub/catalog', methods: ['GET'], requestBody: 'buffered', fetch: request => route(request, async (signal) => {
      const { index } = await readIndex(config, signal)
      const installed: string[] = []
      for (const entry of index.skills) {
        try {
          const stat = await lstat(join(root, entry.name))
          if (stat.isDirectory() || stat.isSymbolicLink()) installed.push(entry.id)
        } catch (error) {
          if (!record(error) || error.code !== 'ENOENT') throw error
        }
      }
      return { ...index, installed }
    }) })
    const install = ctx.connection.fetch.register({ path: '/api/skill-hub/install', methods: ['POST'], requestBody: 'buffered', fetch: request => route(request, async (signal) => {
      if (installing) throw new HubError(409, 'busy')
      installing = true
      try {
        if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') throw new HubError(415, 'invalid-data')
        const body = await readBounded(new Response(request.body), 8192)
        const { url, index } = await readIndex(config, signal)
        const selection = validateInstallSelection(index, JSON.parse(body.toString('utf8')))
        const available = await ctx.skills.list({ signal })
        if (available.some(skill => skill.name === selection.entry.name)) throw new HubError(409, 'conflict')
        if (selection.metadata.parent !== undefined) {
          const parent = available.find(skill => skill.name === selection.metadata.parent)
          if (parent === undefined) throw new HubError(400, 'invalid-parent')
        }
        const bytes = await download(new URL(selection.entry.package, url), config, signal)
        await installPackage(
          root, selection.entry, selection.metadata, bytes,
          { maxBytes: config.maxBytes, maxFiles: config.maxFiles }, signal,
        )
        invalidate()
        return { installed: true, name: selection.entry.name }
      } catch (error) {
        if (error instanceof Error && error.message === 'Installation conflict') throw new HubError(409, 'conflict')
        throw error
      } finally { installing = false }
    }) })
    return async () => {
      lifetime.abort()
      await Promise.all([catalog(), install()])
      await Promise.allSettled(pending)
    }
  }, 'skill-hub: authenticated routes')
}

async function readIndex(config: Config, signal: AbortSignal): Promise<{ url: URL; index: SkillHubIndex }> {
  if (config.catalogUrl.get().trim() === '') throw new HubError(400, 'not-configured')
  const url = catalogUrl(config.catalogUrl.get())
  const bytes = await download(url, config, signal)
  return { url, index: parseSkillHubIndex(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))) }
}

function catalogUrl(value: string): URL {
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username !== '' || url.password !== '' || url.hash !== '' || url.search !== '') throw new HubError(400, 'invalid-url')
  return url
}

async function download(url: URL, config: Config, signal: AbortSignal): Promise<Buffer> {
  const headers: Record<string, string> = { accept: 'application/json' }
  if (config.tokenEnv !== '') {
    const token = process.env[config.tokenEnv]
    if (token === undefined || token.trim() === '') throw new HubError(400, 'missing-token')
    headers.authorization = `Bearer ${token}`
  }
  let response: Response
  try { response = await fetch(url, { signal, redirect: 'error', headers }) } catch (error) {
    if (signal.aborted) throw error
    throw new HubError(502, 'unreachable')
  }
  if (!response.ok) {
    await response.body?.cancel()
    throw new HubError(502, 'upstream-failed')
  }
  return readBounded(response, config.maxBytes)
}

function json(value: object, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })
}

class HubError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code) }
}
