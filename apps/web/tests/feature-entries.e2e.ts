/** Real category menus, draft preservation and live skill classification. */
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { expect, it, onTestFinished } from 'vitest'
import { launchWebScaffold, watchConsole } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage } from './support.ts'

it('selects all eight workflow categories and refreshes custom skills in both themes at 390px and 760px', async () => {
  const evidenceDirectory = process.env.DSH_FEATURE_EVIDENCE_DIR
  if (evidenceDirectory !== undefined) await mkdir(evidenceDirectory, { recursive: true })
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
    const categoryNames = ['Chat', 'PPT reporting', 'Official documents', 'Report writing', 'Data analysis', 'Law enforcement', 'Format proofreading', 'Other']
    expect(await bar.getByRole('button').allTextContents()).toEqual(categoryNames)
    const report = bar.getByRole('button', { name: 'Report writing', exact: true })
    await expect.poll(() => report.isEnabled()).toBe(true)
    const input = page.locator('[data-composer-input]').first()
    expect(await bar.evaluate(element => element.closest('[data-composer-card]') === null)).toBe(true)
    const barBounds = (await bar.boundingBox())!
    const cardBounds = (await page.locator('[data-composer-card]').first().boundingBox())!
    expect(barBounds.y + barBounds.height).toBeLessThanOrEqual(cardBounds.y)
    expect(Math.abs(barBounds.x - cardBounds.x)).toBeLessThan(2)
    const requirements = 'Prepare a report from @"source.md"'
    await input.fill(requirements)
    await report.click()
    expect(await input.innerText()).toBe(requirements)
    const menu = page.getByRole('menu')
    await menu.getByRole('menuitem', { name: 'Report writing', exact: true }).click()
    await expect.poll(() => input.innerText()).toContain('/public-report Prepare a report from @"source.md"')
    await report.click()
    await menu.getByRole('menuitem', { name: /Country brief$/u }).click()
    await expect.poll(() => input.innerText()).toContain('/public-report-country-brief Prepare a report')
    expect(await menu.count()).toBe(0)
    await report.click()
    await menu.getByRole('menuitem', { name: /Organization research$/u }).click()
    expect(await input.innerText()).toContain('/public-report-organization-research Prepare a report')
    await bar.getByRole('button', { name: 'PPT reporting', exact: true }).click()
    await menu.getByRole('menuitem', { name: 'Briefing PPT', exact: true }).click()
    await expect.poll(() => input.innerText()).toContain('/public-ppt Prepare a report')
    await bar.getByRole('button', { name: 'Chat', exact: true }).click()
    expect(await input.innerText()).toContain('/public-ppt')
    await menu.getByRole('menuitem', { name: 'Ordinary chat', exact: true }).click()
    expect(await input.innerText()).toBe(requirements)
    if (await page.locator('[data-sidebar-right-guide]').isVisible()) {
      await page.locator('[data-sidebar-right-toggle]').click()
    }
    const counts = [1, 4, 7, 10, 1, 1, 2, 1]
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      for (const width of [390, 760]) {
        await page.setViewportSize({ width, height: 900 })
        // The responsive shell collapses its sidebar after observing the new width.
        await expect.poll(() => bar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
        if (evidenceDirectory !== undefined) {
          await page.screenshot({ path: join(evidenceDirectory, `categories-${colorScheme}-${width}-overview.png`) })
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        for (const [index, category] of categoryNames.entries()) {
          const button = bar.getByRole('button', { name: category, exact: true })
          expect(await button.isVisible()).toBe(true)
          const buttonBounds = (await button.boundingBox())!
          expect(buttonBounds.x).toBeGreaterThanOrEqual(0)
          expect(buttonBounds.x + buttonBounds.width).toBeLessThanOrEqual(width)
          await button.click()
          await menu.waitFor()
          expect(await menu.getByRole('menuitem').count()).toBe(counts[index])
          const bounds = (await menu.boundingBox())!
          expect(bounds.x).toBeGreaterThanOrEqual(0)
          expect(bounds.y).toBeGreaterThanOrEqual(0)
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
          expect(bounds.y + bounds.height).toBeLessThanOrEqual(buttonBounds.y)
          if (category === 'Report writing' && evidenceDirectory !== undefined) {
            await page.screenshot({ path: join(evidenceDirectory, `categories-${colorScheme}-${width}.png`) })
          }
          await page.keyboard.press('Escape')
          expect(await button.getAttribute('aria-expanded')).toBe('false')
          expect(await menu.count()).toBe(0)
        }
        await report.click()
        await page.keyboard.press('ArrowDown')
        expect(await menu.getByRole('menuitem').first().evaluate(element => element === document.activeElement)).toBe(true)
        await page.locator('body').click({ position: { x: width / 2, y: 100 } })
        expect(await menu.count()).toBe(0)
      }
    }
    const custom = join(skills, 'custom-local')
    const customFile = join(custom, 'SKILL.md')
    await mkdir(custom)
    await writeFile(customFile, '---\nname: custom-local\ndescription: Local software skill\n---\n\nUse workspace materials.\n')
    await bar.getByRole('button', { name: 'Other', exact: true }).click()
    await expect.poll(() => menu.getByRole('menuitem', { name: 'custom-local', exact: true }).count(), { timeout: 10_000 }).toBe(1)
    await menu.getByRole('menuitem', { name: 'custom-local', exact: true }).click()
    expect(await input.innerText()).toContain('/custom-local Prepare a report')
    const classified = (category: string) => `---\nname: custom-local\ndescription: Edited software skill\nmetadata:\n  tiancode:\n    category: ${category}\n    label:\n      zh: 自定义技能\n      en: Edited custom skill\n---\n\nUpdated workspace instructions.\n`
    await writeFile(customFile, classified('data'))
    await bar.getByRole('button', { name: 'Data analysis', exact: true }).click()
    await expect.poll(() => menu.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(1)
    await writeFile(customFile, classified('law'))
    await expect.poll(() => menu.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(0)
    await page.keyboard.press('Escape')
    await bar.getByRole('button', { name: 'Law enforcement', exact: true }).click()
    await expect.poll(() => menu.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(1)
    await input.fill(requirements)
    await page.keyboard.press('Escape')
    await bar.getByRole('button', { name: 'Law enforcement', exact: true }).click()
    expect(await menu.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count()).toBe(1)
    await rm(custom, { recursive: true })
    await expect.poll(() => menu.getByRole('menuitem', { name: 'Edited custom skill', exact: true }).count(), { timeout: 10_000 }).toBe(0)
    await page.keyboard.press('Escape')
    expect(console.warnings).toEqual([])
    expect(console.pageErrors).toEqual([])
  } finally {
    await browser?.close()
    await scaffold.close()
  }
})
