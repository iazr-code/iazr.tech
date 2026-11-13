import { describe, expect, it } from "vitest";

import { localizedPath, pickLocale, resolveLocaleRedirect } from "@/lib/i18n/config";

describe("pickLocale", () => {
  it("falls back to en without a header", () => {
    expect(pickLocale(null)).toBe("en");
  });
  it("picks es for Spanish browsers", () => {
    expect(pickLocale("es-CO,es;q=0.9")).toBe("es");
  });
  it("picks en for English-first browsers", () => {
    expect(pickLocale("en-US,en;q=0.9,es;q=0.8")).toBe("en");
  });
  it("falls back to en for unsupported languages", () => {
    expect(pickLocale("fr-FR")).toBe("en");
  });
  it("chooses the first supported language by q", () => {
    expect(pickLocale("fr;q=1, es;q=0.5")).toBe("es");
  });
});

describe("resolveLocaleRedirect", () => {
  it("redirects the root to the detected locale", () => {
    expect(resolveLocaleRedirect("/", "es")).toBe("/es");
  });
  it("prefixes legacy paths", () => {
    expect(resolveLocaleRedirect("/about", null)).toBe("/en/about");
  });
  it("leaves localized paths alone", () => {
    expect(resolveLocaleRedirect("/es/about", "en")).toBeNull();
    expect(resolveLocaleRedirect("/en", "es")).toBeNull();
  });
});

describe("localizedPath", () => {
  it("swaps the locale segment", () => {
    expect(localizedPath("/es", "en")).toBe("/en");
    expect(localizedPath("/es/about", "en")).toBe("/en/about");
  });
});
