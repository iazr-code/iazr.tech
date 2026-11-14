import { describe, expect, it } from "vitest";

import {
  createMemoryStore,
  createRateLimiter,
  getClientIp,
} from "@/lib/security/rate-limit";

const WINDOW = 600_000;

function limiter(limit = 20, store = createMemoryStore()) {
  let t = 0;
  const rl = createRateLimiter({ limit, windowMs: WINDOW, store, now: () => t });
  return { rl, at: (ms: number) => (t = ms) };
}

describe("createRateLimiter", () => {
  it("allows 20 then blocks the 21st within 10 min", () => {
    const { rl } = limiter();
    for (let i = 0; i < 20; i += 1) expect(rl.check("ip").ok).toBe(true);
    const blocked = rl.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows again after the window expires", () => {
    const { rl, at } = limiter();
    for (let i = 0; i < 21; i += 1) rl.check("ip");
    at(WINDOW + 1);
    expect(rl.check("ip").ok).toBe(true);
  });

  it("uses a sliding window", () => {
    const { rl, at } = limiter();
    for (let i = 0; i < 20; i += 1) {
      at(i * 1000);
      rl.check("ip");
    }
    at(WINDOW + 500);
    expect(rl.check("ip").ok).toBe(true);
    expect(rl.check("ip").ok).toBe(false);
  });

  it("isolates keys", () => {
    const { rl } = limiter(3);
    for (let i = 0; i < 4; i += 1) rl.check("1.1.1.1");
    expect(rl.check("1.1.1.1").ok).toBe(false);
    expect(rl.check("2.2.2.2").ok).toBe(true);
  });

  it("evicts oldest keys over maxKeys", () => {
    const store = createMemoryStore({ maxKeys: 2 });
    const { rl } = limiter(3, store);
    rl.check("a");
    rl.check("b");
    rl.check("c");
    expect(store.size()).toBeLessThanOrEqual(2);
  });
});

describe("getClientIp", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it("takes the first x-forwarded-for entry, trimmed", () => {
    expect(getClientIp(h({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("keeps IPv6 intact", () => {
    expect(getClientIp(h({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(getClientIp(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(getClientIp(h({}))).toBe("unknown");
  });
});
