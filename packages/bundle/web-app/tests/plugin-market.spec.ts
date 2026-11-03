/** The plugin market rows are available only to the Desktop profile. */
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { loadOverlayPatches } from '@deepseek-ai/dsh-app-boot'
import { expect, it, onTestFinished } from 'vitest'

const fixturePlugin = { apply(): void {} }

it.each([
  { profile: 'desktop', disabled: false },
  { profile: 'web', disabled: true },
  { profile: undefined, disabled: true },
])('gates plugin market rows to the Desktop profile ($profile)', async ({ profile, disabled }) => {
  const rows = loadOverlayPatches('plugin-market', fileURLToPath(new URL('../cordis.patch.yml', import.meta.url)))
    .flatMap(patch => patch.insert ?? []).filter(row => row.id === 'plugin-market' || row.id === 'ui-plugin-market')
  expect(rows.map(row => [row.id, row.name])).toEqual([
    ['plugin-market', '@deepseek-ai/dsh-plugin-market'],
    ['ui-plugin-market', '@deepseek-ai/dsh-client-ui-plugin-market'],
  ])
  expect(rows).toHaveLength(2)

  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  if (profile !== undefined) {
    ctx.provide('profileContext', {
      name: profile, dir: '/profile', patchPath: '/profile/cordis.patch.yml', installAnchor: '/profile/package.json',
      cwd: '/workspace', home: '/home', startedBundles: [], overlays: [], telemetryDisabledEnv: undefined,
    })
  }
  ctx.baseUrl = 'file:///'
  await ctx.plugin(Loader).await()
  ctx.loader.builtins.market = fixturePlugin
  ctx.loader.builtins.uiMarket = fixturePlugin
  await ctx.loader.root.update(rows.map(row => ({
    ...row,
    name: row.id === 'plugin-market' ? 'cordis:market' : 'cordis:uiMarket',
  })))
  await ctx.loader.await()
  expect(ctx.loader.resolve('plugin-market').disabled).toBe(disabled)
  expect(ctx.loader.resolve('ui-plugin-market').disabled).toBe(disabled)
  expect(ctx.loader.resolve('plugin-market').fiber !== undefined).toBe(!disabled)
  expect(ctx.loader.resolve('ui-plugin-market').fiber !== undefined).toBe(!disabled)
})
