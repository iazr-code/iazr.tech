import { describe, expect, it } from "vitest";

import { createGeneration, createUploadQueue, cropRectForAspect, portalTextureUrl } from "@/lib/world/textures";

describe("cropRectForAspect", () => {
  it("crops taller images from the top", () => {
    expect(cropRectForAspect(1600, 1000, 2)).toEqual({ x: 0, y: 0, w: 1600, h: 800 });
    expect(cropRectForAspect(1000, 1000, 2)).toEqual({ x: 0, y: 0, w: 1000, h: 500 });
  });

  it("centers horizontally when the image is wider than the aspect", () => {
    expect(cropRectForAspect(3000, 1000, 2)).toEqual({ x: 500, y: 0, w: 2000, h: 1000 });
  });
});

describe("createUploadQueue", () => {
  it("runs one task per flush by default", () => {
    const q = createUploadQueue();
    const ran: number[] = [];
    [1, 2, 3].forEach((n) => q.enqueue(() => ran.push(n)));
    expect(q.flush()).toBe(1);
    expect(q.size()).toBe(2);
    expect(ran).toEqual([1]);
    q.flush();
    q.flush();
    expect(q.size()).toBe(0);
    expect(q.flush()).toBe(0);
    expect(ran).toEqual([1, 2, 3]);
  });

  it("respects a custom per-frame budget", () => {
    const q = createUploadQueue(2);
    [1, 2, 3].forEach(() => q.enqueue(() => {}));
    expect(q.flush()).toBe(2);
    expect(q.size()).toBe(1);
  });
});

describe("createUploadQueue.clear", () => {
  it("drops pending tasks so stale uploads never run", () => {
    const q = createUploadQueue();
    let ran = 0;
    q.enqueue(() => ran++);
    q.enqueue(() => ran++);
    q.clear();
    expect(q.size()).toBe(0);
    q.flush();
    expect(ran).toBe(0);
  });
});

describe("createGeneration", () => {
  it("marks earlier generations as stale after next()", () => {
    const gen = createGeneration();
    const first = gen.next();
    expect(gen.isCurrent(first)).toBe(true);
    const second = gen.next();
    expect(gen.isCurrent(first)).toBe(false);
    expect(gen.isCurrent(second)).toBe(true);
  });
});

describe("portalTextureUrl", () => {
  it("builds the power-of-two texture path per tier size", () => {
    expect(portalTextureUrl("zolaris", 1024)).toBe("/textures/projects/zolaris-1024.webp");
    expect(portalTextureUrl("zolaris", 512)).toBe("/textures/projects/zolaris-512.webp");
  });
});
