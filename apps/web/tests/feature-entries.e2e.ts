/** Real composer discovery, draft preservation and responsive workflow controls. */
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { expect, it, onTestFinished } from 'vitest'
import { launchWebScaffold, watchConsole } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage } from './support.ts'

it('selects installed office workflows, preserves drafts and fits both themes and narrow viewports', async () => {
  const resources = await mkdtemp(join(tmpdir(), 'tiancode-feature-skills-'))
  onTestFinished(() => rm(resources, { recursive: true, force: true }))
  const skills = join(resources, 'skills')
  await cp(new URL('../../../skills/', import.meta.url), skills, { recursive: true })
  const overlay = join(resources, 'features.yml')
  await writeFile(overlay, (await readFile(new URL('./feature-entries.overlay.yml', import.meta.url), 'utf8'))
    .replace('!!js process.cwd() + "/skills"', JSON.stringify(skills)))
  const scaffold = await launchWebScaffold({
    extraOverlayPath: overlay,
    profile: { packages: [{ dir: fileURLToPath(new URL('../../../packages/skill/skill-office/', import.meta.url)) }] },
    replayFixture: fileURLToPath(new URL('../../../snapshots/web/plan-narrow-viewport/session.v3.jsonl', import.meta.url)),
    replayProvidersOnly: true,
  })
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined
  try {
    browser = await chromium.launch()
    const page = await newEnglishPage(browser)
    const console = watchConsole(page)
    await page.goto(scaffold.authenticatedUrl)
    await connectFreshWorkspace(page, scaffold.workspaceCwd)
    const bar = page.getByLabel('Office assistant', { exact: true })
    await bar.waitFor()
    const report = bar.getByRole('button', { name: 'Report writing', exact: true })
    await expect.poll(() => report.isEnabled()).toBe(true)
    const input = page.locator('[data-composer-input]').first()
    expect(await bar.evaluate(element => element.closest('[data-composer-card]') === null)).toBe(true)
    const barBounds = (await bar.boundingBox())!
    const cardBounds = (await page.locator('[data-composer-card]').first().boundingBox())!
    expect(barBounds.y + barBounds.height).toBeLessThanOrEqual(cardBounds.y)
    expect(Math.abs(barBounds.x - cardBounds.x)).toBeLessThan(2)
    await input.fill('Prepare a report from @"source.md"')
    await report.click()
    await expect.poll(() => input.innerText()).toContain('/public-report Prepare a report from @"source.md"')
    const templateMenu = page.getByRole('menu')
    await templateMenu.getByRole('menuitem', { name: 'Country brief', exact: true }).click()
    await expect.poll(() => input.innerText()).toContain('/public-report-country-brief Prepare a report')
    expect(await templateMenu.count()).toBe(0)
    await report.click()
    await templateMenu.getByRole('menuitem', { name: 'Organization research', exact: true }).click()
    expect(await input.innerText()).toContain('/public-report-organization-research Prepare a report')
    await bar.getByRole('button', { name: 'Briefing PPT', exact: true }).click()
    await expect.poll(() => input.innerText()).toContain('/public-ppt Prepare a report')
    expect(await bar.innerText()).not.toContain('Add requirements')
    expect(await bar.innerText()).not.toContain('Choose a template')
    await bar.getByRole('button', { name: 'Chat', exact: true }).click()
    expect(await input.innerText()).not.toContain('/public-ppt')
    if (await page.locator('[data-sidebar-right-guide]').isVisible()) {
      await page.locator('[data-sidebar-right-toggle]').click()
    }
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await page.setViewportSize({ width: 760, height: 900 })
      expect(await bar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
      await report.click()
      await templateMenu.waitFor()
      const templateBounds = (await templateMenu.boundingBox())!
      const reportBounds = (await report.boundingBox())!
      expect(templateBounds.y + templateBounds.height).toBeLessThanOrEqual(reportBounds.y)
      expect(templateBounds.x).toBeGreaterThanOrEqual(0)
      expect(templateBounds.y).toBeGreaterThanOrEqual(0)
      await page.keyboard.press('Escape')
      expect(await report.getAttribute('aria-expanded')).toBe('false')
      await report.click()
      await page.locator('body').click({ position: { x: 380, y: 100 } })
      expect(await templateMenu.count()).toBe(0)
      await bar.getByRole('button', { name: 'More', exact: true }).click()
      const menu = page.getByRole('menu')
      await menu.waitFor()
      expect(await menu.getByRole('menuitem', { name: 'Work summary', exact: true }).count()).toBe(1)
      const bounds = await menu.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(760)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900)
      await page.keyboard.press('Escape')
      expect(await menu.count()).toBe(0)
      await bar.getByRole('button', { name: 'More', exact: true }).click()
      await page.locator('body').click({ position: { x: 380, y: 100 } })
      expect(await menu.count()).toBe(0)
    }
    await page.setViewportSize({ width: 430, height: 900 })
    expect(await bar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    const custom = join(skills, 'custom-local')
    await mkdir(custom)
    await writeFile(join(custom, 'SKILL.md'), '---\nname: custom-local\ndescription: Local software skill\n---\n\nUse workspace materials.\n')
    await bar.getByRole('button', { name: 'More', exact: true }).click()
    await expect.poll(() => page.getByRole('menuitem', { name: 'custom-local', exact: true }).count(), { timeout: 10_000 }).toBe(1)
    await page.getByRole('menuitem', { name: 'custom-local', exact: true }).click()
    expect(await input.innerText()).toContain('/custom-local Prepare a report')
    await writeFile(join(custom, 'SKILL.md'), '---\nname: custom-local\ndescription: Edited software skill\nmetadata:\n  tiancode:\n    label:\n      zh: 自定义技能\n      en: Edited custom skill\n---\n\nUpdated workspace instructions.\n')
    await bar.getByRole('button', { name: 'More', exact: true }).click()
    await expect.poll(() => page.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(1)
    await page.keyboard.press('Escape')
    await rm(custom, { recursive: true })
    await bar.getByRole('button', { name: 'More', exact: true }).click()
    await expect.poll(() => page.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(0)
    await page.keyboard.press('Escape')
    expect(console.warnings).toEqual([])
    expect(console.pageErrors).toEqual([])
  } finally {
    await browser?.close()
    await scaffold.close()
  }
})
