/** Installer artwork must contain the supplied TianCode logo in each theme and DPI variant. */
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

describe('TianCode installer artwork', () => {
  for (const theme of ['light', 'dark']) {
    for (const scale of [1, 2]) {
      it(`uses the supplied logo in ${theme} at ${scale}x`, async () => {
        const suffix = `${theme === 'dark' ? '-dark' : ''}${scale === 2 ? '-2x' : ''}`
        const asset = await readFile(new URL(`../installer/assets/brand${suffix}.png`, import.meta.url))
        const image = sharp(asset)
        const metadata = await image.metadata()
        expect([metadata.width, metadata.height]).toEqual([600 * scale, 196 * scale])
        const expected = await sharp(await readFile(new URL('../renderer/assets/tiancode-logo-horizontal.png', import.meta.url)))
          .resize(480 * scale, 151 * scale, { fit: 'fill' }).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer()
        const actual = await image.extract({ left: 60 * scale, top: 22 * scale, width: 480 * scale, height: 151 * scale })
          .flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer()
        expect(actual.equals(expected)).toBe(true)
      })
    }
  }
})
