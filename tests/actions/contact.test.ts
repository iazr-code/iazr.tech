import { beforeAll, describe, expect, it, vi } from "vitest";

let currentIp = "1.1.1.1";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": currentIp }),
}));

beforeAll(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.POSTHOG_KEY;
});

const { submitContact } = await import("@/app/actions/contact");
const { initialContactState } = await import("@/lib/contact-state");

function form() {
  const fd = new FormData();
  fd.set("name", "Ada Lovelace");
  fd.set("email", "ada@example.com");
  fd.set("service", "fullstack");
  fd.set("message", "Necesito una plataforma web de alto rendimiento.");
  fd.set("locale", "es");
  return fd;
}

describe("submitContact validation vs rate limit", () => {
  it("does not spend the limit on submissions that fail validation", async () => {
    currentIp = "3.3.3.3";
    for (let i = 0; i < 4; i += 1) {
      const bad = form();
      bad.set("message", "corto");
      const res = await submitContact(initialContactState, bad);
      expect(res.message).toBe("invalid");
    }
    const ok = await submitContact(initialContactState, form());
    expect(ok.status).toBe("success");
  });
});

describe("submitContact rate limit", () => {
  it("allows 3 submissions per IP, blocks the 4th, and does not block other IPs", async () => {
    currentIp = "1.1.1.1";
    for (let i = 0; i < 3; i += 1) {
      const ok = await submitContact(initialContactState, form());
      expect(ok.status).toBe("success");
    }
    const blocked = await submitContact(initialContactState, form());
    expect(blocked.status).toBe("error");
    expect(blocked.message).toBe("rate_limited");

    currentIp = "2.2.2.2";
    const other = await submitContact(initialContactState, form());
    expect(other.status).toBe("success");
  });
});
