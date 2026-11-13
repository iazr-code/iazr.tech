import { describe, expect, it } from "vitest";

import { buildArcSegments } from "@/lib/world/geometry";

describe("buildArcSegments", () => {
  it("returns line-segment pairs for every arc", () => {
    const data = buildArcSegments(14, 1.6, 24);
    expect(data).toBeInstanceOf(Float32Array);
    expect(data.length).toBe(14 * 24 * 2 * 3);
  });

  it("keeps every point on or above the sphere surface", () => {
    const data = buildArcSegments(14, 1.6, 24);
    for (let i = 0; i < data.length; i += 3) {
      expect(Math.hypot(data[i], data[i + 1], data[i + 2])).toBeGreaterThanOrEqual(1.6 - 1e-6);
    }
  });

  it("connects consecutive segments (end of one = start of the next)", () => {
    const data = buildArcSegments(1, 1, 4);
    for (let s = 0; s < 3; s += 1) {
      const end = data.slice(s * 6 + 3, s * 6 + 6);
      const nextStart = data.slice((s + 1) * 6, (s + 1) * 6 + 3);
      expect(Array.from(end)).toEqual(Array.from(nextStart));
    }
  });
});
