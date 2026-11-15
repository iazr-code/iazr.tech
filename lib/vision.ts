/**
 * Frame analysis for the vision scanner, on a small greyscale copy of each
 * camera frame. Pure functions over pixel arrays, so they are unit-tested.
 */

export type FrameStats = {
  /** Mean luminance 0..255. */
  brightness: number;
  /** Standard deviation of luminance (contrast). */
  contrast: number;
  /** Share of pixels that changed since the previous frame (0..1). */
  motion: number;
  /** Share of pixels on a strong edge (0..1). */
  edges: number;
  /** Bounding box of the changed pixels in 0..1 frame units, or null. */
  box: { x: number; y: number; w: number; h: number } | null;
};

/** RGBA bytes to luminance (Rec. 601 weights). */
export function toLuma(rgba: Uint8ClampedArray, out?: Float32Array): Float32Array {
  const n = rgba.length / 4;
  const luma = out && out.length === n ? out : new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    luma[i] = rgba[i * 4] * 0.299 + rgba[i * 4 + 1] * 0.587 + rgba[i * 4 + 2] * 0.114;
  }
  return luma;
}

export function analyseFrame(luma: Float32Array, prev: Float32Array | null, width: number, height: number): FrameStats {
  const n = width * height;
  let sum = 0;
  for (let i = 0; i < n; i += 1) sum += luma[i];
  const brightness = sum / n;
  let variance = 0;
  for (let i = 0; i < n; i += 1) variance += (luma[i] - brightness) ** 2;
  const contrast = Math.sqrt(variance / n);

  let moved = 0;
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  let edgeCount = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gx = luma[i + 1] - luma[i - 1];
      const gy = luma[i + width] - luma[i - width];
      if (Math.abs(gx) + Math.abs(gy) > 48) edgeCount += 1;
      if (prev && Math.abs(luma[i] - prev[i]) > 28) {
        moved += 1;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  const inner = Math.max(1, (width - 2) * (height - 2));
  const motion = prev ? moved / inner : 0;
  const box =
    prev && moved > inner * 0.004 && x1 >= x0
      ? { x: x0 / width, y: y0 / height, w: (x1 - x0 + 1) / width, h: (y1 - y0 + 1) / height }
      : null;
  return { brightness, contrast, motion, edges: edgeCount / inner, box };
}

/** A readable verdict for the HUD from the stats. */
export function frameVerdict(s: FrameStats): "dark" | "flat" | "moving" | "ready" {
  if (s.brightness < 28) return "dark";
  if (s.contrast < 14) return "flat";
  if (s.motion > 0.06) return "moving";
  return "ready";
}
