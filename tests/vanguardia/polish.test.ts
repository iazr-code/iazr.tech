import { describe, expect, it } from "vitest";

import { classify, processTransaction, SAMPLES } from "@/lib/sandbox";
import { filterCommands } from "@/lib/palette";
import { buildJsonLdGraph, PORTRAIT_URL } from "@/lib/seo/json-ld";
import { es } from "@/lib/i18n/dictionaries/es";
import { en } from "@/lib/i18n/dictionaries/en";
import { POST } from "@/app/api/sandbox/route";

describe("architecture sandbox", () => {
  it("classifies the three sample contacts", () => {
    expect(classify(SAMPLES[0].text).intent).toBe("booking");
    expect(classify(SAMPLES[0].text).entities).toMatchObject({ day: "jueves", time: "10:30" });
    expect(classify(SAMPLES[1].text).intent).toBe("review");
    expect(classify(SAMPLES[2].text)).toMatchObject({ intent: "quote", entities: { sites: 3, invoicesPerDay: 40, erp: "Siigo Nube" } });
    expect(classify(en.tracks.sandbox.samples[0].text).intent).toBe("booking");
  });

  it("measures every stage with the given clock and routes by intent", () => {
    let t = 0;
    const r = processTransaction(SAMPLES[2], () => (t += 0.5), new Date("2026-11-14T15:00:00Z"));
    expect(r.timingsMs).toEqual({ ingest: 0.5, ai: 0.5, route: 0.5, report: 0.5, total: 2 });
    expect(r.route.workflow).toContain("cotizacion");
    expect(r.route.records.erp).toMatchObject({ system: "Siigo Nube", lines: 3 });
    expect(r.report.row).toMatchObject({ fecha: "2026-11-14", intencion: "quote" });
  });

  it("validates and answers on the API route", async () => {
    const ok = await POST(new Request("http://x/api/sandbox", { method: "POST", body: JSON.stringify(SAMPLES[0]), headers: { "x-forwarded-for": "1.1.1.1" } }));
    expect(ok.status).toBe(200);
    expect((await ok.json()).ai.intent).toBe("booking");
    const bad = await POST(new Request("http://x/api/sandbox", { method: "POST", body: JSON.stringify({ source: "fax", text: "" }), headers: { "x-forwarded-for": "1.1.1.2" } }));
    expect(bad.status).toBe(400);
  });
});

describe("command palette search", () => {
  const cmds = [
    { id: "roi", group: "Acciones", label: "Ir a la calculadora de ROI", keywords: "retorno ahorro" },
    { id: "cv", group: "Fundador", label: "Descargar el CV", keywords: "hoja de vida" },
    { id: "scan", group: "Acciones", label: "Lanzar el escáner de visión", keywords: "camara" },
  ];
  it("ignores accents and case, needs every word, ranks label starts first", () => {
    expect(filterCommands(cmds, "").map((c) => c.id)).toEqual(["roi", "cv", "scan"]);
    expect(filterCommands(cmds, "ESCANER").map((c) => c.id)).toEqual(["scan"]);
    expect(filterCommands(cmds, "cámara").map((c) => c.id)).toEqual(["scan"]);
    expect(filterCommands(cmds, "hoja vida").map((c) => c.id)).toEqual(["cv"]);
    expect(filterCommands(cmds, "descargar")[0].id).toBe("cv");
    expect(filterCommands(cmds, "zzz")).toEqual([]);
  });
});

describe("JSON-LD graph", () => {
  it("has the agency, the service with both tracks, the founder with 15 certifications and the new portrait", () => {
    const graph = buildJsonLdGraph("es")["@graph"] as Record<string, unknown>[];
    expect(graph.map((n) => n["@type"])).toEqual(["Organization", "ProfessionalService", "Person", "WebSite"]);
    const person = graph[2] as { image: { url: string }; hasCredential: { credentialCategory: string }[] };
    expect(person.image.url).toBe(PORTRAIT_URL);
    expect(PORTRAIT_URL).toMatch(/\/images\/ivan-zuniga\.jpg$/);
    expect(person.hasCredential.filter((c) => c.credentialCategory === "certificate")).toHaveLength(15);
    const service = graph[1] as { hasOfferCatalog: { itemListElement: unknown[] } };
    expect(service.hasOfferCatalog.itemListElement).toHaveLength(es.tracks.items.length);
  });
});
