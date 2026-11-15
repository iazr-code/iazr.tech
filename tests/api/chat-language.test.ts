import { beforeAll, describe, expect, it } from "vitest";

import { detectLanguage, languageDirective } from "@/lib/ai/language";

beforeAll(() => {
  delete process.env.GROQ_API_KEY;
});

const { POST } = await import("@/app/api/chat/route");

const ask = (text: string, locale: "es" | "en", ip: string) =>
  POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ locale, messages: [{ id: "1", role: "user", parts: [{ type: "text", text }] }] }),
    })
  );

describe("chat language", () => {
  it("detects Spanish and English from the visitor's words", () => {
    expect(detectLanguage("Cuanto me puede costar una pagina web simple")).toBe("es");
    expect(detectLanguage("¿Trabajan con empresas en Estados Unidos?")).toBe("es");
    expect(detectLanguage("How much does a simple website cost?")).toBe("en");
    expect(detectLanguage("Do you work with companies in the US?")).toBe("en");
    expect(detectLanguage("Zolaris")).toBeNull();
    expect(languageDirective("en")).toContain("ONLY in English");
  });

  it("answers in English on the Spanish page when asked in English (demo mode)", async () => {
    const res = await ask("How much does a simple website cost?", "es", "10.9.0.1");
    const body = await res.text();
    expect(body).toContain("The live assistant");
    expect(body).not.toContain("GROQ_API_KEY");
  });

  it("answers in Spanish on the English page when asked in Spanish (demo mode)", async () => {
    const res = await ask("Cuanto me puede costar una pagina web simple", "en", "10.9.0.2");
    const body = await res.text();
    expect(body).toContain("asistente en vivo");
    expect(body).not.toContain("IAZR — Iván");
  });
});
