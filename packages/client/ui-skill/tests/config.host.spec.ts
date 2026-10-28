/** Loader updates validate composer shortcuts before publishing client preferences. */
import { Context } from '@deepseek-ai/cordis'
import { expect, it, onTestFinished } from 'vitest'
import { liveConfig, omitsGeneratedPage } from '../../../settings/settings/tests/live-config.ts'
import { plainConfig } from '../../../settings/settings/src/schema.ts'
import * as HostPlugin from '../src/index.ts'

it('hides shortcuts by default and accepts only skill names on live updates', async () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const configuration = await liveConfig(ctx, HostPlugin)
  expect(plainConfig(configuration.fiber.config)).toEqual({ quickActions: [], quickActionProviders: [] })
  await configuration.update({ quickActions: ['public-report', 'custom-workflow'], quickActionProviders: [] })
  expect(plainConfig(configuration.fiber.config)).toEqual({ quickActions: ['public-report', 'custom-workflow'], quickActionProviders: [] })
  for (const quickActions of [['../outside'], ['/public-report'], ['public report'], 'public-report']) {
    await expect(configuration.update({ quickActions })).rejects.toThrow()
  }
  expect(plainConfig(configuration.fiber.config)).toEqual({ quickActions: ['public-report', 'custom-workflow'], quickActionProviders: [] })
})

it('keeps its instance off generated Settings pages', () => omitsGeneratedPage(ctx => ctx.plugin(HostPlugin)))
