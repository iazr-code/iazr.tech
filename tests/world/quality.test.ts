import { describe, expect, it } from "vitest";

import { detectInitialTier, stepTier, type TierEnv } from "@/lib/world/quality";

const base: TierEnv = { webgl: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 8, coarsePointer: false };

describe("detectInitialTier", () => {
  it("goes static for reduced motion, save-data or no WebGL", () => {
    expect(detectInitialTier({ ...base, reducedMotion: true })).toBe("static");
    expect(detectInitialTier({ ...base, saveData: true })).toBe("static");
    expect(detectInitialTier({ ...base, webgl: false })).toBe("static");
  });

  it("goes low on weak CPUs and low-memory phones", () => {
    expect(detectInitialTier({ ...base, cores: 2 })).toBe("low");
    expect(detectInitialTier({ ...base, coarsePointer: true, deviceMemory: 4 })).toBe("low");
  });

  it("goes medium on capable phones and low-memory desktops", () => {
    expect(detectInitialTier({ ...base, coarsePointer: true, deviceMemory: 8 })).toBe("medium");
    expect(detectInitialTier({ ...base, deviceMemory: 2 })).toBe("medium");
  });

  it("goes high on capable desktops", () => {
    expect(detectInitialTier(base)).toBe("high");
  });
});

describe("stepTier", () => {
  it("steps down to low and stops", () => {
    expect(stepTier("high", "down")).toBe("medium");
    expect(stepTier("medium", "down")).toBe("low");
    expect(stepTier("low", "down")).toBe("low");
  });
  it("steps up to high and stops", () => {
    expect(stepTier("low", "up")).toBe("medium");
    expect(stepTier("medium", "up")).toBe("high");
    expect(stepTier("high", "up")).toBe("high");
  });
  it("never leaves static", () => {
    expect(stepTier("static", "down")).toBe("static");
    expect(stepTier("static", "up")).toBe("static");
  });
});
