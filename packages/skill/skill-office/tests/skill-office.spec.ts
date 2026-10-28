import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as SkillOffice from '@deepseek-ai/dsh-skill-office'
import { isSea } from 'node:sea'
import { execa } from 'execa'
import { describe, expect, it, vi } from 'vitest'

vi.mock('node:sea', () => ({ isSea: vi.fn(() => false) }))

const assets = fileURLToPath(new URL('../assets/', import.meta.url))
const publicSkills = fileURLToPath(new URL('../../../../skills/', import.meta.url))
const names = ['office', 'office-docx', 'office-export-pdf', 'office-pptx', 'office-recalculate', 'office-render', 'office-xlsx']

describe('bundled Office skills', () => {
  it('loads public-service workflows and reporting templates only when enabled', async () => {
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      const fiber = await ctx.plugin(SkillOffice, {
        publicService: true, publicSkillDir: publicSkills, publicServiceWatch: false, cli: false,
      })
      const catalog = await ctx.skills.list()
      for (const name of ['public-ppt', 'public-report', 'public-document', 'public-minutes', 'public-summary',
        'public-plan', 'public-speech', 'public-proofread', 'public-ledger']) {
        expect(catalog.some(skill => skill.name === name)).toBe(true)
        expect((await ctx.skills.get(name))?.content).toContain('工作区')
      }
      const report = await ctx.skills.get('public-report')
      expect(report?.content).toContain('public-report-country-brief')
      expect(report?.content).toContain('确认')
      const templates = await readFile(join(publicSkills, 'public-report', 'templates.md'), 'utf8')
      for (const title of ['国别单篇', '国别热点', '组织单篇', '组织调研', '热点事件', '国别月度综述', '组织月度综述', '年度综述', '邮件']) expect(templates).toContain(title)
      const categories = catalog.filter(skill => skill.metadata?.tiancode !== undefined && skill.name.startsWith('public-report-'))
      expect(categories).toHaveLength(9)
      for (const category of categories) {
        const skill = await ctx.skills.get(category.name)
        expect(skill?.content).toContain('template.md')
        expect((await readFile(join(publicSkills, category.name, 'template.md'), 'utf8')).length).toBeGreaterThan(1800)
      }
      await fiber.dispose()
      expect(await ctx.skills.list()).toEqual([])
    } finally {
      await ctx.fiber.dispose()
    }
  })

  it('discovers added software skills and reloads edited files without loading generic agent roots', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tiancode-skills-'))
    const ctx = new Context()
    try {
      const directory = join(root, 'skills')
      const entry = join(directory, 'custom-software')
      await mkdir(entry, { recursive: true })
      const skill = (description: string) => `---
name: custom-software
description: ${description}
---

工作区 skill body: ${description}
`
      await writeFile(join(entry, 'SKILL.md'), skill('Initial custom workflow'))
      await mkdir(join(root, '.agents', 'skills', 'agent-only'), { recursive: true })
      await writeFile(join(root, '.agents', 'skills', 'agent-only', 'SKILL.md'), '---\nname: agent-only\ndescription: Excluded agent workflow\n---\n\nAgent instructions.\n')
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(SkillOffice, { publicService: true, publicSkillDir: directory, cli: false })
      expect((await ctx.skills.list({ cwd: root })).filter(skill => skill.provider === 'tiancode').map(skill => skill.name)).toEqual(['custom-software'])
      expect((await ctx.skills.list({ cwd: root })).some(skill => skill.name === 'agent-only')).toBe(false)
      await writeFile(join(entry, 'SKILL.md'), skill('Edited custom workflow'))
      await expect.poll(async () => (await ctx.skills.list()).find(skill => skill.name === 'custom-software')?.description,
        { timeout: 10_000 }).toBe('Edited custom workflow')
      expect((await ctx.skills.get('custom-software'))?.content).toContain('Edited custom workflow')
      await mkdir(join(directory, 'another-skill'))
      await writeFile(join(directory, 'another-skill', 'SKILL.md'), '---\nname: another-skill\ndescription: Added after startup\n---\n\nNew workflow.\n')
      await expect.poll(async () => (await ctx.skills.list()).some(skill => skill.name === 'another-skill'),
        { timeout: 10_000 }).toBe(true)
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })

  it('requires a named absolute software skill directory when public-service discovery is enabled', async () => {
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      await expect(ctx.plugin(SkillOffice, { publicService: true })).rejects.toThrow(/publicSkillDir/u)
    } finally { await ctx.fiber.dispose() }
  })

  it('keeps routing and authoring within the progressive context budgets', async () => {
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(SkillOffice)
      const catalog = await ctx.skills.list()
      expect(catalog.map(skill => skill.name)).toEqual(names)
      const route = (await ctx.skills.get('office'))!
      expect(Math.ceil(route.description.length / 4)).toBeLessThanOrEqual(50)
      expect(Math.ceil(route.content.length / 4)).toBeLessThanOrEqual(200)
      for (const [name, previousTokens] of [['office-docx', 1688], ['office-pptx', 1879], ['office-xlsx', 2330]] as const) {
        const skill = (await ctx.skills.get(name))!
        expect(Math.ceil(skill.content.length / 4)).toBeLessThanOrEqual(Math.floor(previousTokens * 0.65))
        expect(skill.content).not.toMatch(/read_image|transparent|DPI/)
        expect(skill.content).not.toContain('dsoffice')
        expect(skill.content).toContain('office-render')
      }
    } finally { await ctx.fiber.dispose() }
  })

  it('loads each packaged body and removes all candidates on disposal', async () => {
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      const fiber = await ctx.plugin(SkillOffice)
      const catalog = await ctx.skills.list()
      expect(catalog.map(skill => skill.name)).toEqual(names)
      for (const skill of catalog) {
        expect(skill.description.length).toBeLessThanOrEqual(500)
        expect(skill).toMatchObject({ source: 'bundled', provider: 'dsh-office', invocation: { modelInvocable: true, userInvocable: true } })
        const loaded = await ctx.skills.get(skill.name)
        expect(loaded?.resourceBase).toEqual({ kind: 'directory', path: join(assets, skill.name).split(sep).join('/') })
        const raw = await readFile(join(assets, skill.name, 'SKILL.md'), 'utf8')
        const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, '').trim()
        expect(loaded?.content.startsWith(body)).toBe(true)
        if (!['office-render', 'office-recalculate', 'office-export-pdf'].includes(skill.name)) expect(loaded?.content).toBe(body)
      }
      await fiber.dispose()
      expect(await ctx.skills.list()).toEqual([])
    } finally {
      await ctx.fiber.dispose()
    }
  })

  it.each([false, true])('loads relocated resources through a real cordis.yml composition (public service: %s)', async (publicService) => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-office-skills-'))
    const ctx = new Context()
    try {
      const external = join(root, '中文 assets')
      await cp(assets, external, { recursive: true })
      const configPath = join(root, 'cordis.yml')
      await writeFile(configPath, [
        "- name: '@deepseek-ai/dsh-skill'",
        "- name: '@deepseek-ai/dsh-skill-office'",
        '  config:',
        `    publicService: ${String(publicService)}`,
        `    publicSkillDir: ${JSON.stringify(publicSkills)}`,
        '    publicServiceWatch: false',
        `    assetRoot: ${JSON.stringify(external)}`,
        '',
      ].join('\n'))
      ctx.baseUrl = pathToFileURL(root).href + '/'
      await ctx.plugin(Loader)
      ctx.loader.builtins.include = Include
      const modules = new Map<string, unknown>([
        ['@deepseek-ai/dsh-skill', SkillRegistry],
        ['@deepseek-ai/dsh-skill-office', SkillOffice],
      ])
      ctx.loader.internal = {
        version: 'v2',
        loadCache: new Map(),
        register() { throw new Error('unexpected register') },
        getOrCreateModuleJob() { throw new Error('unexpected module job') },
        resolveSync() { throw new Error('unexpected resolution') },
        load() { throw new Error('unexpected load') },
        async import(specifier: string) {
          if (!modules.has(specifier)) throw new Error(`Unexpected Loader import: ${specifier}`)
          return modules.get(specifier)
        },
      }
      await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
      await ctx.loader.await()
      const catalogNames = (await ctx.skills.list()).map(skill => skill.name)
      expect(catalogNames.filter(name => name === 'office' || name.startsWith('office-'))).toEqual(names)
      expect(catalogNames.includes('public-report')).toBe(publicService)
      if (publicService) {
        const report = await ctx.skills.get('public-report')
        expect(report?.resourceBase).toEqual({ kind: 'directory', path: join(publicSkills, 'public-report').split(sep).join('/') })
        expect(await readFile(join(publicSkills, 'public-report', 'templates.md'), 'utf8')).toContain('组织调研')
      }
      const loaded = await ctx.skills.get('office-xlsx')
      expect(loaded?.resourceBase).toEqual({ kind: 'directory', path: join(external, 'office-xlsx').split(sep).join('/') })
      const raw = await readFile(join(external, 'office-xlsx', 'SKILL.md'), 'utf8')
      const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, '').trim()
      expect(loaded?.content).toBe(body)
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })

  it.each([
    ['description: "Quoted: description"', '\r\n', 'Quoted: description'],
    ['description: >-\n  Folded\n  description', '\n', 'Folded description'],
  ])('parses frontmatter %s and leaves body metadata-like lines intact', async (header, newline, description) => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-office-metadata-'))
    const ctx = new Context()
    try {
      await cp(assets, root, { recursive: true })
      const body = '# Office instructions\n\ndescription: instruction text'
      await writeFile(join(root, 'office-docx', 'SKILL.md'), `---\n${header}\n---\n\n${body}\n`.replaceAll('\n', newline))
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(SkillOffice, { assetRoot: root })
      const skill = await ctx.skills.get('office-docx')
      expect(skill?.description).toBe(description)
      expect(skill?.content).toBe(body.replaceAll('\n', newline))
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })

  it('rejects relative resource paths and incomplete asset trees before registration', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-office-invalid-'))
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      expect(() => { SkillOffice.apply(ctx, { assetRoot: 'assets' }) }).toThrow('absolute directory')
      await cp(assets, root, { recursive: true })
      await rm(join(root, 'office-docx', 'SKILL.md'))
      expect(() => { SkillOffice.apply(ctx, { assetRoot: root }) }).toThrow('SKILL.md')
      await writeFile(join(root, 'office-docx', 'SKILL.md'), '# Missing frontmatter\ndescription: body text\n')
      expect(() => { SkillOffice.apply(ctx, { assetRoot: root }) }).toThrow('has no YAML frontmatter')
      for (const header of ['', 'null', 'scalar', 'name: office-docx', 'description: 3', 'description: ""']) {
        await writeFile(join(root, 'office-docx', 'SKILL.md'), `---\n${header}\n---\n# Instructions\n`)
        expect(() => { SkillOffice.apply(ctx, { assetRoot: root }) }).toThrow('has no description')
      }
      expect(await ctx.skills.list()).toEqual([])
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })
})

it('executes capabilities using only paths returned by the loaded skill from a separate workspace', async () => {
  const root = await mkdtemp(join(tmpdir(), 'office CLI 工作目录 '))
  const ctx = new Context()
  try {
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(SkillOffice)
    const skill = await ctx.skills.get('office-render')
    const json = skill?.content.match(/\n(\{\n[\s\S]+)$/u)?.[1]
    expect(json).toBeDefined()
    const { libreofficeKit } = JSON.parse(json!) as { libreofficeKit: { node: string; cli: string } }
    const result = await execa(libreofficeKit.node, [libreofficeKit.cli, 'capabilities'], {
      cwd: root, env: { PATH: '' }, timeout: 20_000, killSignal: 'SIGKILL', reject: false,
    })
    expect(result.timedOut, result.stderr).toBe(false)
    expect(result.signal, result.stderr).toBeUndefined()
    expect(result.exitCode, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({ runtime: { version: '0.1.5', cliPath: libreofficeKit.cli } })
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})


it('validates operation paths on loading while authoring remains available', async () => {
  const ctx = new Context()
  const original = Object.getOwnPropertyDescriptor(process.versions, 'electron')
  try {
    await ctx.plugin(SkillRegistry)
    for (const config of [{ node: 'node' }, { cli: 'cli.js' }, { node: assets }, { cli: assets }, { cli: join(assets, 'missing.js') }]) {
      const fiber = await ctx.plugin(SkillOffice, config)
      expect((await ctx.skills.get('office-docx'))?.content).toContain('python-docx')
      await expect(ctx.skills.get('office-render')).rejects.toThrow()
      await fiber.dispose()
    }
    const carrier = await ctx.plugin(SkillOffice)
    vi.mocked(isSea).mockReturnValue(true)
    await expect(ctx.skills.get('office-render')).rejects.toThrow('standalone Node')
    vi.mocked(isSea).mockReturnValue(false)
    Object.defineProperty(process.versions, 'electron', { value: '44.0.0', configurable: true })
    await expect(ctx.skills.get('office-render')).rejects.toThrow('standalone Node')
    await carrier.dispose()
    const disabled = await ctx.plugin(SkillOffice, { cli: false })
    expect((await ctx.skills.get('office-render'))?.content).toContain('disabled in this deployment')
    await disabled.dispose()
    await ctx.plugin(SkillOffice, { node: process.execPath })
    expect((await ctx.skills.get('office-render'))?.content).toContain(JSON.stringify(process.execPath))
  } finally {
    vi.mocked(isSea).mockReturnValue(false)
    if (original === undefined) Reflect.deleteProperty(process.versions, 'electron')
    else Object.defineProperty(process.versions, 'electron', original)
    await ctx.fiber.dispose()
  }
})
