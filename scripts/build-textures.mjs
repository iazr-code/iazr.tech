/**
 * Genera las texturas de los portales 3D a partir de public/proyectos/*.png:
 * recorte 2:1 anclado arriba y salida webp en potencia de 2 (1024×512 y
 * 512×256). Ejecutar al cambiar una captura: `npm run textures`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "textures", "projects");
mkdirSync(out, { recursive: true });

// id del proyecto (lib/data/projects.ts) → captura original.
const PROJECTS = {
  "la-campana": "LaCampana.png",
  "emssanar-eps": "EmssanarEPS.png",
  "paisajes-sonoros": "PaisajesSonoros.png",
  "dozurcol-pasto": "DozurcolPasto.png",
  "portafolio-sandra": "PortafolioSandraGomez.png",
  "panini-2026": "Panini2026.png",
  "metodo-sonora": "MetodoSonora.png",
  zolaris: "Zolaris.png",
  "sst-medsys": "SSTMedSys.png",
};

const ASPECT = 2;
const SIZES = [1024, 512];

function crop(w, h) {
  if (w / h > ASPECT) {
    const cw = Math.round(h * ASPECT);
    return { x: Math.round((w - cw) / 2), y: 0, w: cw, h };
  }
  return { x: 0, y: 0, w, h: Math.round(w / ASPECT) };
}

let total = 0;
for (const [id, file] of Object.entries(PROJECTS)) {
  const image = await loadImage(readFileSync(join(root, "public", "proyectos", file)));
  const c = crop(image.width, image.height);
  for (const size of SIZES) {
    const canvas = createCanvas(size, size / ASPECT);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, c.x, c.y, c.w, c.h, 0, 0, size, size / ASPECT);
    const buffer = await canvas.encode("webp", 82);
    writeFileSync(join(out, `${id}-${size}.webp`), buffer);
    total += buffer.length;
  }
  console.log(`✓ ${id} (${image.width}×${image.height})`);
}
console.log(`Texturas generadas: ${Object.keys(PROJECTS).length * SIZES.length} · ${(total / 1024).toFixed(0)} KB`);
