// Generates the PWA / app icons for tsetseglen.mn from a single SVG source.
// Brand: blossom mark (Цэцэглэн = "to bloom") in white on the brand pink #c2185b.
// Re-run after a brand-color or logo change:  node scripts/generate-pwa-icons.mjs
//
// Outputs:
//   public/icon-192.png            – manifest icon (purpose: any)
//   public/icon-512.png            – manifest icon (purpose: any)
//   public/icon-maskable-512.png   – manifest icon (purpose: maskable, flower kept inside safe zone)
//   src/app/apple-icon.png         – iOS home-screen icon (Next auto-links apple-touch-icon)

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BRAND = '#c2185b';      // --primary
const PETAL = '#ffffff';
const CENTER = '#f8bbd0';     // --primary-light

// A 6-petal blossom centred in a 100x100 viewBox.
// `scale` shrinks the flower toward the centre so maskable icons keep content
// inside the central 80% safe zone Android crops to.
function flowerSvg(size, { scale = 1, bg = BRAND } = {}) {
  const petals = Array.from({ length: 6 }, (_, i) =>
    `<ellipse cx="0" cy="-22" rx="9" ry="16" transform="rotate(${i * 60})" />`
  ).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="${bg}"/>
  <g transform="translate(50 50) scale(${scale})">
    <g fill="${PETAL}">${petals}</g>
    <circle r="12" fill="${CENTER}"/>
    <circle r="5" fill="${BRAND}"/>
  </g>
</svg>`;
}

async function png(svg, size, outRel) {
  const out = path.join(ROOT, outRel);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log('wrote', outRel);
}

await png(flowerSvg(192), 192, 'public/icon-192.png');
await png(flowerSvg(512), 512, 'public/icon-512.png');
await png(flowerSvg(512, { scale: 0.78 }), 512, 'public/icon-maskable-512.png');
await png(flowerSvg(180), 180, 'src/app/apple-icon.png');
