import { describe, expect, it } from "vitest";

import { computeSectionRanges, curveProgress, localProgress } from "@/lib/world/scroll-store";

describe("computeSectionRanges", () => {
  it("maps a section to global scroll progress", () => {
    const [r] = computeSectionRanges([{ id: "services", top: 1000, height: 1000 }], 5000, 1000);
    expect(r.start).toBeCloseTo(0.25);
    expect(r.end).toBeCloseTo(0.5);
  });

  it("recomputes coherently after a resize", () => {
    const sections = [
      { id: "hero" as const, top: 0, height: 1000 },
      { id: "services" as const, top: 1000, height: 2000 },
    ];
    const before = computeSectionRanges(sections, 5000, 1000);
    const after = computeSectionRanges(sections, 8000, 1000);
    expect(after[1].start).toBeCloseTo(1000 / 7000);
    expect(after[1].start).not.toBeCloseTo(before[1].start);
  });

  it("returns ordered, non-overlapping ranges clamped to 0..1", () => {
    const ranges = computeSectionRanges(
      [
        { id: "contact", top: 4000, height: 1500 },
        { id: "hero", top: 0, height: 1000 },
        { id: "projects", top: 1000, height: 3000 },
      ],
      5500,
      1000
    );
    expect(ranges.map((r) => r.id)).toEqual(["hero", "projects", "contact"]);
    for (let i = 1; i < ranges.length; i += 1) expect(ranges[i].start).toBeGreaterThanOrEqual(ranges[i - 1].end - 1e-9);
    for (const r of ranges) {
      expect(r.start).toBeGreaterThanOrEqual(0);
      expect(r.end).toBeLessThanOrEqual(1);
    }
  });
});

describe("curveProgress", () => {
  const ranges = computeSectionRanges(
    ["hero", "services", "projects", "journey", "chat", "contact"].map((id, i) => ({
      id: id as "hero",
      top: i * 1000,
      height: 1000,
    })),
    7000,
    1000
  );

  it("is 0 at the top and 1 at the bottom", () => {
    expect(curveProgress(0, ranges)).toBe(0);
    expect(curveProgress(1, ranges)).toBe(1);
  });

  it("reaches keyframe i when section i is centered", () => {
    const projects = ranges[2];
    const mid = (projects.start + projects.end) / 2;
    expect(curveProgress(mid, ranges)).toBeCloseTo(2 / 5);
  });

  it("never decreases while scrolling down", () => {
    let prev = 0;
    for (let p = 0; p <= 1; p += 0.002) {
      const u = curveProgress(p, ranges);
      expect(u).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = u;
    }
  });

  it("falls back to raw progress without ranges", () => {
    expect(curveProgress(0.3, [])).toBeCloseTo(0.3);
  });
});

describe("localProgress", () => {
  const range = { id: "projects" as const, start: 0.4, end: 0.6 };
  it("is 0 at start, 1 at end, negative before", () => {
    expect(localProgress(0.4, range)).toBeCloseTo(0);
    expect(localProgress(0.6, range)).toBeCloseTo(1);
    expect(localProgress(0.3, range)).toBeLessThan(0);
  });
});
