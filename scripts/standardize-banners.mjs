/**
 * One-time script: standardize all desktop hero banner images to 1717×916.
 * Images 1, 3, 4 are already 1717×916 — they are left untouched.
 * Image 2 is 1983×793 (wider ratio) — it is fitted with contain mode
 * inside a 1717×916 canvas padded with a brand-pink background (#FBD7E6)
 * so the full artwork is preserved with zero cropping.
 *
 * Run once: node scripts/standardize-banners.mjs
 */

import sharp from 'sharp'
import path  from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HERO_DIR  = path.join(__dirname, '..', 'public', 'hero')

// Target canvas dimensions (majority ratio = images 1,3,4)
const TARGET_W = 1717
const TARGET_H = 916

// Brand-pink padding fill — blends with most banner backgrounds
const FILL = { r: 251, g: 215, b: 230, alpha: 1 }  // #FBD7E6

const files = ['image1.png', 'image2.png', 'image3.png', 'image4.png']

async function standardize(filename) {
  const src  = path.join(HERO_DIR, filename)
  const meta = await sharp(src).metadata()

  if (meta.width === TARGET_W && meta.height === TARGET_H) {
    console.log(`✓ ${filename} already ${TARGET_W}×${TARGET_H} — skipped`)
    return
  }

  console.log(`  ${filename}: ${meta.width}×${meta.height} → ${TARGET_W}×${TARGET_H}`)

  // fit:'contain' scales the image down (if needed) so it fits fully inside
  // TARGET_W × TARGET_H, then pads the remaining space with FILL color.
  await sharp(src)
    .resize(TARGET_W, TARGET_H, {
      fit:        'contain',
      position:   'center',
      background: FILL,
    })
    .png({ compressionLevel: 8 })
    .toFile(src + '.tmp')

  // Atomic overwrite
  fs.renameSync(src + '.tmp', src)
  console.log(`✓ ${filename} saved as ${TARGET_W}×${TARGET_H}`)
}

console.log(`\nStandardizing hero banners to ${TARGET_W}×${TARGET_H}…\n`)
for (const f of files) {
  await standardize(f)
}

console.log('\nAll done. Run `npx next build` to pick up the new files.\n')
