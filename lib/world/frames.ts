/**
 * The WebGL world only draws inside DOM frames ([data-world-frame]): the hero's
 * lit frame and the cases frame. These pure helpers turn frame rectangles (CSS
 * px, viewport-relative) into a scissor box and a camera-space plane.
 */

export type Rect = { x: number; y: number; w: number; h: number };

/** Union of the frames that intersect the viewport, or null when none does. */
export function visibleFrame(rects: Rect[], vw: number, vh: number): Rect | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rects) {
    if (r.w <= 0 || r.h <= 0) continue;
    if (r.x + r.w <= 0 || r.x >= vw || r.y + r.h <= 0 || r.y >= vh) continue;
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  if (x0 === Infinity) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Scissor box in drawing-buffer pixels (origin bottom-left), clamped to the buffer. */
export function scissorBox(rect: Rect, vh: number, dpr: number, bufferW: number, bufferH: number): Rect {
  void vh;
  const left = Math.max(0, Math.round(rect.x * dpr));
  const right = Math.min(bufferW, Math.round((rect.x + rect.w) * dpr));
  const top = Math.max(0, Math.round(rect.y * dpr));
  const bottom = Math.min(bufferH, Math.round((rect.y + rect.h) * dpr));
  return { x: left, y: bufferH - bottom, w: Math.max(0, right - left), h: Math.max(0, bottom - top) };
}

/**
 * A plane at `distance` in front of a perspective camera (vertical `fovDeg`)
 * that covers `rect` exactly: its centre offset and size in world units.
 */
export function planeForRect(
  rect: Rect,
  vw: number,
  vh: number,
  distance: number,
  fovDeg: number
): { x: number; y: number; width: number; height: number } {
  const worldH = 2 * distance * Math.tan((fovDeg * Math.PI) / 360);
  const k = worldH / vh;
  return {
    x: (rect.x + rect.w / 2 - vw / 2) * k,
    y: -(rect.y + rect.h / 2 - vh / 2) * k,
    width: rect.w * k,
    height: rect.h * k,
  };
}

/** Reads every [data-world-frame] rect from the DOM. */
export function readFrames(root: ParentNode = document): { el: HTMLElement; rect: Rect }[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-world-frame]"), (el) => {
    const r = el.getBoundingClientRect();
    return { el, rect: { x: r.left, y: r.top, w: r.width, h: r.height } };
  });
}

/** Frames measured this frame by the renderer; scenes read it in useFrame (no React state). */
export const frameState: { rects: Record<string, Rect | undefined>; vw: number; vh: number } = {
  rects: {},
  vw: 1,
  vh: 1,
};
