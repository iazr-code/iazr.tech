import { describe, expect, it } from "vitest";

import { CAMERA_KEYFRAMES, cameraPoseAt } from "@/lib/world/camera-path";

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe("cameraPoseAt", () => {
  it("clamps progress outside 0..1", () => {
    expect(cameraPoseAt(-1)).toEqual(cameraPoseAt(0));
    expect(cameraPoseAt(2)).toEqual(cameraPoseAt(1));
  });

  it("starts and ends at the first and last keyframes", () => {
    const first = CAMERA_KEYFRAMES[0];
    const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
    expect(dist(cameraPoseAt(0).position, first.position)).toBeLessThan(1e-6);
    expect(dist(cameraPoseAt(1).position, last.position)).toBeLessThan(1e-6);
  });

  it("moves smoothly between consecutive samples", () => {
    let prev = cameraPoseAt(0);
    for (let p = 0.001; p <= 1; p += 0.001) {
      const next = cameraPoseAt(p);
      expect(dist(prev.position, next.position)).toBeLessThan(0.5);
      expect(dist(prev.target, next.target)).toBeLessThan(0.5);
      prev = next;
    }
  });
});
