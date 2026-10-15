/** Generate the native installer bitmaps from the supplied TianCode artwork. */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const logo = await readFile(new URL('../renderer/assets/tiancode-logo-horizontal.png', import.meta.url))
for (const theme of ['light', 'dark']) {
  for (const scale of [1, 2]) {
    const artwork = await sharp(logo).resize(480 * scale, 151 * scale, { fit: 'fill' })
      .flatten({ background: '#ffffff' }).png().toBuffer()
    // A light backing preserves the supplied dark wordmark on the dark installer page.
    const backing = Buffer.from(`<svg width="${600 * scale}" height="${196 * scale}"><rect x="${40 * scale}" y="${10 * scale}" width="${520 * scale}" height="${176 * scale}" rx="${16 * scale}" fill="white"/></svg>`)
    const suffix = `${theme === 'dark' ? '-dark' : ''}${scale === 2 ? '-2x' : ''}`
    const image = await sharp({ create: {
      width: 600 * scale, height: 196 * scale, channels: 3,
      background: theme === 'dark' ? '#151517' : '#ffffff',
    } }).composite([
      { input: backing, left: 0, top: 0 },
      { input: artwork, left: 60 * scale, top: 22 * scale },
    ]).png().toBuffer()
    await writeFile(fileURLToPath(new URL(`../installer/assets/brand${suffix}.png`, import.meta.url)), image)
  }
}
