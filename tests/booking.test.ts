import { describe, expect, it } from "vitest";

import { resolveBookingUrl } from "@/lib/booking";

describe("resolveBookingUrl", () => {
  it("rejects missing or empty values", () => {
    expect(resolveBookingUrl(undefined)).toBeNull();
    expect(resolveBookingUrl("")).toBeNull();
    expect(resolveBookingUrl("   ")).toBeNull();
  });

  it("rejects non-https and malformed URLs", () => {
    expect(resolveBookingUrl("http://cal.com/x")).toBeNull();
    expect(resolveBookingUrl("javascript:alert(1)")).toBeNull();
    expect(resolveBookingUrl("not a url")).toBeNull();
    expect(resolveBookingUrl("data:text/html,<script>")).toBeNull();
  });

  it("accepts https URLs, trimmed", () => {
    expect(resolveBookingUrl("https://cal.com/iazr/30min")).toBe("https://cal.com/iazr/30min");
    expect(resolveBookingUrl("  https://calendly.com/iazr  ")).toBe("https://calendly.com/iazr");
  });
});
