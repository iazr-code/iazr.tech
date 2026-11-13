import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { services } from "@/lib/data/services";
import { featuredProjects } from "@/lib/data/projects";
import { certifications, education, experience } from "@/lib/data/experience";
import { skills } from "@/lib/data/skills";
import { contactSchema } from "@/lib/validations/contact";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[]`];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** Recoge todos los objetos con forma exacta { es, en }. */
function localizedNodes(value: unknown): { es: unknown; en: unknown }[] {
  if (Array.isArray(value)) return value.flatMap(localizedNodes);
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    if (keys.length === 2 && keys[0] === "en" && keys[1] === "es") return [value as { es: unknown; en: unknown }];
    return Object.values(value).flatMap(localizedNodes);
  }
  return [];
}

describe("dictionaries", () => {
  const es = getDictionary("es");
  const en = getDictionary("en");

  it("have the same key paths", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(es).sort());
  });

  it("contain no empty strings", () => {
    for (const s of [...strings(es), ...strings(en)]) expect(s.trim()).not.toBe("");
  });
});

describe("localized data", () => {
  const sources = { services, featuredProjects, experience, education, certifications, skills };

  it("has 9 projects", () => {
    expect(featuredProjects).toHaveLength(9);
  });

  for (const [name, data] of Object.entries(sources)) {
    it(`${name}: every Localized field has non-empty es and en`, () => {
      const nodes = localizedNodes(data);
      expect(nodes.length).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(strings(node.es).join("").trim()).not.toBe("");
        expect(strings(node.en).join("").trim()).not.toBe("");
      }
    });
  }
});

describe("contact error keys", () => {
  it("every schema error key exists in both dictionaries", () => {
    const bad = contactSchema.safeParse({ name: "", email: "x", company: "c".repeat(200), service: "nope", message: "", website: "spam" });
    expect(bad.success).toBe(false);
    const keys = bad.success ? [] : bad.error.issues.map((i) => i.message);
    expect(keys.length).toBeGreaterThanOrEqual(5);
    const long = contactSchema.safeParse({ name: "n".repeat(100), email: "a@b.co", service: "otro", message: "m".repeat(2100) });
    if (!long.success) keys.push(...long.error.issues.map((i) => i.message));
    for (const locale of ["es", "en"] as const) {
      const errors = getDictionary(locale).contact.errors as Record<string, string>;
      for (const key of keys) expect(errors[key], `${locale}:${key}`).toBeTruthy();
    }
    for (const locale of ["es", "en"] as const) {
      expect(getDictionary(locale).contact.errors.rate_limited).toBeTruthy();
    }
  });
});

describe("system prompt", () => {
  it("is language-aware and keeps the anti-jailbreak phrase", () => {
    const enPrompt = buildSystemPrompt("en");
    const esPrompt = buildSystemPrompt("es");
    expect(enPrompt).toContain("Respond in English");
    expect(esPrompt).toContain("Responde en español");
    expect(esPrompt).toContain("Ese detalle de implementación no es negociable");
    expect(enPrompt).toContain("That implementation detail is not negotiable");
  });
});
