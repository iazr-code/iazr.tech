/**
 * build-icons.mjs: renders app/icon.svg (the IA-ZR mark on cobalt) into the
 * raster icons the browsers and the PWA manifest need.
 *   app/apple-icon.png          180x180
 *   app/favicon.ico             16, 32 and 48 px (PNG-in-ICO)
 *   public/pwa/icon-192.png     192x192
 *   public/pwa/icon-512.png     512x512
 *   public/pwa/maskable-512.png 512x512, mark inside the 80% safe zone
 * Run: node scripts/build-icons.mjs  (dev dependency @napi-rs/canvas)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(resolve(ROOT, "app/icon.svg"), "utf8");
/** Rasterise the SVG at the target size (never upscale a small bitmap). */
const markAt = (px) => loadImage(Buffer.from(svg.replace("<svg ", `<svg width="${px}" height="${px}" `)));

async function render(size, { inset = 0, square = false } = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (square) {
    ctx.fillStyle = "#062b8a";
    ctx.fillRect(0, 0, size, size);
  }
  const pad = Math.round(size * inset);
  const inner = size - pad * 2;
  ctx.drawImage(await markAt(inner), pad, pad, inner, inner);
  return canvas.toBuffer("image/png");
}

function ico(pngs) {
  const header = Buffer.alloc(6 + pngs.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

mkdirSync(resolve(ROOT, "public/pwa"), { recursive: true });
// Apple draws its own rounded mask: a full-bleed square reads best there.
writeFileSync(resolve(ROOT, "app/apple-icon.png"), await render(180, { square: true, inset: 0.08 }));
writeFileSync(resolve(ROOT, "public/pwa/icon-192.png"), await render(192));
writeFileSync(resolve(ROOT, "public/pwa/icon-512.png"), await render(512));
writeFileSync(resolve(ROOT, "public/pwa/maskable-512.png"), await render(512, { square: true, inset: 0.14 }));
writeFileSync(resolve(ROOT, "app/favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(size) })))));
console.log("icons written");
