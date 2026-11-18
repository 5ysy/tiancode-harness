/** A private catalog installs through the real Host and appears in TianCode categories. */
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'
import { buildCatalog } from '../../../packages/skill/skill-hub/src/builder.ts'
import { launchWebScaffold, watchConsole, type WebScaffold } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage, openSettings } from './support.ts'

it('installs a complete community skill and refreshes its selected category', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'dsh-skill-hub-web-'))
  const source = join(scratch, 'source')
  const publicDir = join(scratch, 'public')
  const installed = join(scratch, 'installed')
  const responses = new Map<string, Buffer>()
  const server = createServer((request, response) => {
    const bytes = responses.get(request.url ?? '')
    response.writeHead(bytes === undefined ? 404 : 200, { 'content-type': 'application/json' })
    response.end(bytes)
  })
  let scaffold: WebScaffold | undefined
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined
  try {
    await mkdir(join(source, 'references'), { recursive: true })
    await writeFile(join(source, 'SKILL.md'), '---\nname: hub-writer\ndescription: Draft community documents\nmetadata:\n  author: Community\n---\nRead references/style.md before writing.\n')
    await writeFile(join(source, 'references/style.md'), 'Preserve source context.')
    const catalog = await buildCatalog([source], publicDir)
    responses.set('/catalog.json', await readFile(join(publicDir, 'catalog.json')))
    for (const entry of catalog.skills) responses.set('/' + entry.package, await readFile(join(publicDir, entry.package)))
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('Catalog server address unavailable')
    const overlay = join(scratch, 'overlay.yml')
    await writeFile(overlay, `- id: skill-hub\n  config: ${JSON.stringify({ catalogUrl: '', installRoot: installed })}\n- id: ui-skill\n  config:\n    quickActions: [hub-writer]\n    quickActionProviders: [skill-hub]\n`)
    scaffold = await launchWebScaffold({ profile: { packages: [{ dir: process.env.DSH_SKILL_HUB_BUNDLE_DIR ?? resolve('packages/experimental/skill-hub-bundle'), enabled: true }] }, extraOverlayPath: overlay })
    browser = await chromium.launch()
    const page = await newEnglishPage(browser)
    const console = watchConsole(page)
    await page.goto(scaffold.authenticatedUrl)
    await page.waitForSelector('[class*="frame"]')
    await connectFreshWorkspace(page, scaffold.workspaceCwd)
    await openSettings(page, 'en')
    await page.getByRole('button', { name: 'Skill Hub', exact: true }).click()
    await page.getByLabel('Skill catalog URL', { exact: true }).fill(`http://127.0.0.1:${address.port}/catalog.json`)
    await page.getByRole('button', { name: 'Save and connect', exact: true }).click()
    await page.getByRole('heading', { name: 'hub-writer', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Install skill', exact: true }).click()
    await page.getByRole('button', { name: 'TianCode category', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Documents', exact: true }).click()
    await page.getByLabel('Chinese display name').fill('内网文档助手')
    await page.getByLabel('English display name').fill('Internal writer')
    const screenshotDir = process.env.DSH_SKILL_HUB_SCREENSHOTS ?? scratch
    await mkdir(screenshotDir, { recursive: true })
    await page.screenshot({ path: join(screenshotDir, 'skill-hub-install-form.png'), fullPage: true })
    await page.getByRole('button', { name: 'Install skill', exact: true }).click()
    await page.getByText('Installed. Available in its category and skill commands.', { exact: true }).waitFor()
    expect(await readFile(join(installed, 'hub-writer/references/style.md'), 'utf8')).toBe('Preserve source context.')
    expect(await readFile(join(installed, 'hub-writer/SKILL.md'), 'utf8')).toContain('category: document')
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      for (const width of [1100, 390]) {
        await page.setViewportSize({ width, height: 900 })
        expect(await page.getByRole('button', { name: 'Skill Hub', exact: true }).isVisible()).toBe(true)
        expect(await page.locator('html').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
        await page.screenshot({ path: join(screenshotDir, `skill-hub-${scheme}-${width}.png`), fullPage: true })
      }
    }
    await page.setViewportSize({ width: 1100, height: 900 })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Official documents', exact: true }).click()
    await page.screenshot({ path: join(screenshotDir, 'skill-hub-category-menu.png'), fullPage: true })
    await expect.poll(() => page.getByRole('menuitem').allTextContents(), { timeout: 30_000 }).toContain('Internal writer')
    expect(console.pageErrors).toEqual([])
  } finally {
    await browser?.close()
    await scaffold?.close()
    await new Promise<void>((resolve, reject) => { server.close((error) => { if (error !== undefined) reject(error); else resolve() }) })
    await rm(scratch, { recursive: true, force: true })
  }
})
