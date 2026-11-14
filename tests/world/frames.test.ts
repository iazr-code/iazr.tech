import { describe, expect, it } from "vitest";

import { planeForRect, scissorBox, visibleFrame } from "@/lib/world/frames";

const vw = 1440;
const vh = 900;

describe("visibleFrame", () => {
  it("returns null when no frame intersects the viewport", () => {
    expect(visibleFrame([{ x: 80, y: -800, w: 1280, h: 400 }, { x: 80, y: 1200, w: 600, h: 300 }], vw, vh)).toBeNull();
    expect(visibleFrame([], vw, vh)).toBeNull();
  });

  it("returns the frame on screen", () => {
    expect(visibleFrame([{ x: 80, y: 500, w: 1280, h: 400 }], vw, vh)).toEqual({ x: 80, y: 500, w: 1280, h: 400 });
  });

  it("ignores zero-size frames (hidden ones)", () => {
    expect(visibleFrame([{ x: 0, y: 100, w: 0, h: 0 }], vw, vh)).toBeNull();
  });

  it("unions several visible frames", () => {
    expect(
      visibleFrame(
        [
          { x: 80, y: -100, w: 600, h: 300 },
          { x: 700, y: 600, w: 500, h: 500 },
        ],
        vw,
        vh
      )
    ).toEqual({ x: 80, y: -100, w: 1120, h: 1200 });
  });
});

describe("scissorBox", () => {
  it("flips y to the drawing buffer's bottom-left origin and scales by dpr", () => {
    expect(scissorBox({ x: 80, y: 500, w: 1280, h: 400 }, vh, 2, 2880, 1800)).toEqual({ x: 160, y: 0, w: 2560, h: 800 });
  });

  it("clamps to the buffer when the frame runs past the screen", () => {
    expect(scissorBox({ x: -20, y: -100, w: 500, h: 300 }, vh, 1, 1440, 900)).toEqual({ x: 0, y: 700, w: 480, h: 200 });
  });

  it("never returns a negative size", () => {
    expect(scissorBox({ x: 0, y: 2000, w: 100, h: 100 }, vh, 1, 1440, 900)).toEqual({ x: 0, y: 0, w: 100, h: 0 });
  });
});

describe("planeForRect", () => {
  it("maps a rect centred on screen to the camera axis", () => {
    const p = planeForRect({ x: 420, y: 250, w: 600, h: 400 }, vw, vh, 6, 45);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
    const worldH = 2 * 6 * Math.tan((45 * Math.PI) / 360);
    expect(p.height).toBeCloseTo((400 / vh) * worldH, 6);
    expect(p.width).toBeCloseTo((600 / vh) * worldH, 6);
  });

  it("puts a rect right of and below centre at positive x and negative y", () => {
    const p = planeForRect({ x: 900, y: 600, w: 400, h: 200 }, vw, vh, 6, 45);
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(0);
  });
});
