import { describe, expect, it } from "vitest";

import { computeRoi, DEFAULT_INPUTS, fitValue, recommendTrack, WEEKS_PER_MONTH } from "@/lib/roi";
import { detectActions, parseRoiPrefill } from "@/lib/agent/actions";
import { buildNeuralGraph, fibonacciSphere, springStep } from "@/lib/world/neural";
import { analyseFrame, frameVerdict, toLuma } from "@/lib/vision";
import { encodeWinAnsi, PdfPage, renderPdf, textWidth, wrapText } from "@/lib/pdf/writer";
import { buildProposalPdf } from "@/lib/pdf/proposal";
import { speakable, pickVoice } from "@/lib/voice";
import { describeActions } from "@/lib/ai/system-prompt";
import { parseChatRequest } from "@/lib/validations/chat";
import { featuredProjects, INDUSTRIES } from "@/lib/data/projects";
import { es } from "@/lib/i18n/dictionaries/es";

describe("ROI estimate", () => {
  it("derives every figure from the inputs and the visible assumptions", () => {
    const r = computeRoi({ ...DEFAULT_INPUTS, daily: 40, hours: 15, value: 80, lostShare: 0.1, closeShare: 0.2, automationShare: 0.6 });
    expect(r.hoursSavedMonth).toBeCloseTo(15 * WEEKS_PER_MONTH * 0.6);
    expect(r.recoveredLeadsMonth).toBe(120);
    expect(r.recoveredCustomersMonth).toBeCloseTo(24);
    expect(r.revenueMonth).toBeCloseTo(1920);
    expect(r.revenueYear).toBeCloseTo(23040);
    expect(r.cumulative).toHaveLength(12);
    expect(r.cumulative[11]).toBeCloseTo(r.revenueYear);
  });

  it("is zero, never negative, when the inputs are zero or out of range", () => {
    const r = computeRoi({ ...DEFAULT_INPUTS, daily: -5, hours: -1, value: -10, lostShare: 3 });
    expect(r.revenueMonth).toBe(0);
    expect(r.hoursSavedMonth).toBe(0);
  });

  it("recommends a track from front-desk volume and back-office hours", () => {
    expect(recommendTrack(40, 10)).toBe("via01");
    expect(recommendTrack(20, 30)).toBe("via02");
    expect(recommendTrack(120, 40)).toBe("both");
    expect(recommendTrack(3, 12)).toBe("via02");
  });

  it("fits a value to the currency's range and step", () => {
    expect(fitValue(123, "USD")).toBe(120);
    expect(fitValue(5, "USD")).toBe(10);
    expect(fitValue(99_999_999, "COP")).toBe(5_000_000);
  });
});

describe("AI agent page actions", () => {
  it("finds the calculator with figures and prefills them", () => {
    const actions = detectActions("Calcula mi ROI con 60 mensajes al día y 20 horas semanales, cada cliente vale $150");
    const roi = actions.find((a) => a.code === "roi");
    expect(roi && roi.code === "roi" && roi.prefill).toEqual({ daily: 60, hours: 20, value: 150, currency: "USD" });
  });

  it("reads pesos as COP and thousands separators", () => {
    expect(parseRoiPrefill("el ticket promedio es de 250.000 pesos")).toEqual({ value: 250000, currency: "COP" });
  });

  it("opens the booking drawer, shows a named case and the portal", () => {
    expect(detectActions("Quiero agendar un diagnóstico").map((a) => a.code)).toEqual(["booking"]);
    expect(detectActions("Show me the Zolaris case")).toContainEqual({ code: "case", id: "zolaris" });
    expect(detectActions("¿Cómo funciona el acceso con passkey?").map((a) => a.code)).toContain("portal");
  });

  it("does nothing for a plain question", () => {
    expect(detectActions("¿Trabajan con empresas en Estados Unidos?")).toEqual([]);
  });

  it("sends codes only and the prompt describes them from fixed text", () => {
    const parsed = parseChatRequest({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "hola" }] }],
      actions: ["roi", "booking", "roi"],
    });
    expect(parsed.ok && parsed.actions).toEqual(["roi", "booking"]);
    expect(parseChatRequest({ messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "x" }] }], actions: ["rm -rf"] }).ok).toBe(false);
    expect(describeActions([], "es")).toBe("");
    expect(describeActions(["roi"], "en")).toContain("ROI calculator");
  });
});

describe("neural core geometry", () => {
  it("puts nodes on the unit sphere and links each to its neighbours once", () => {
    const pts = fibonacciSphere(50);
    for (const [x, y, z] of pts) expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
    const g = buildNeuralGraph(60, 3);
    const keys = new Set(g.edges.map(([a, b]) => `${a}-${b}`));
    expect(keys.size).toBe(g.edges.length);
    expect(g.edges.length).toBeGreaterThanOrEqual(90);
    expect(g.edges.every(([a, b]) => a < b)).toBe(true);
  });

  it("settles the spring on its target", () => {
    let v = 0;
    let x = 0;
    for (let i = 0; i < 240; i += 1) [x, v] = springStep(x, v, 1, 1 / 60);
    expect(x).toBeCloseTo(1, 2);
  });
});

describe("vision analysis", () => {
  const W = 20;
  const H = 10;
  const flat = (v: number) => new Float32Array(W * H).fill(v);

  it("reads brightness, contrast and motion", () => {
    const prev = flat(100);
    const next = flat(100);
    for (let y = 2; y < 6; y += 1) for (let x = 4; x < 9; x += 1) next[y * W + x] = 220;
    const s = analyseFrame(next, prev, W, H);
    expect(s.brightness).toBeGreaterThan(100);
    expect(s.contrast).toBeGreaterThan(0);
    expect(s.motion).toBeGreaterThan(0);
    expect(s.box).not.toBeNull();
    expect(frameVerdict({ ...s, brightness: 10 })).toBe("dark");
  });

  it("converts RGBA to luminance", () => {
    expect(Array.from(toLuma(new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])))).toEqual([255, 0]);
  });
});

describe("PDF proposal", () => {
  it("encodes Spanish text in WinAnsi and measures it", () => {
    expect(encodeWinAnsi("Año €")).toEqual([0x41, 0xf1, 0x6f, 0x20, 0x80]);
    expect(textWidth("ñ", 10)).toBeCloseTo(textWidth("n", 10));
    expect(wrapText("uno dos tres cuatro cinco seis", 10, 60).length).toBeGreaterThan(1);
  });

  it("writes a valid single-page file with correct cross-reference offsets", () => {
    const page = new PdfPage();
    page.text("Hola", 40, 40);
    const pdf = renderPdf(page, { title: "Prueba", author: "IA-ZR" });
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    const xref = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(xref, xref + 4)).toBe("xref");
    const offsets = [...pdf.slice(xref).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
    offsets.forEach((o, i) => expect(pdf.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
    // ASCII only, so byte offsets equal string offsets.
    expect(/^[\x00-\x7f]*$/.test(pdf)).toBe(true);
  });

  it("builds the proposal from the calculator figures", () => {
    const result = computeRoi(DEFAULT_INPUTS);
    const pdf = buildProposalPdf({
      labels: es.roi.pdf,
      inputs: DEFAULT_INPUTS,
      result,
      figures: { daily: "40", hours: "15", value: "US$80", lost: "10 %", close: "20 %", automation: "60 %", hoursSaved: "39 h", leads: "120", revenue: "US$1.920", revenueYear: "US$23.040" },
      track: { name: es.roi.tracks.via01, reason: es.roi.reasons.via01, items: ["Agente de IA en WhatsApp"] },
      client: "Clínica Andina",
      date: "14 de noviembre de 2026",
      contact: { email: "iazr.code@gmail.com", whatsapp: "+57 322 913 2643", instagram: "@iazr.tech", site: "iazr.tech" },
    });
    expect(pdf).toContain("/Count 1");
    expect(pdf.length).toBeGreaterThan(3000);
  });
});

describe("voice helpers", () => {
  it("strips markdown and URLs before speaking", () => {
    expect(speakable("**Hola** mira [el caso](https://x.y) en https://iazr.tech ya")).toBe("Hola mira el caso en ya");
  });

  it("prefers a local voice in the exact language", () => {
    const v = (lang: string, localService: boolean) => ({ lang, localService }) as SpeechSynthesisVoice;
    expect(pickVoice([v("en-US", true), v("es-ES", true), v("es-CO", false)], "es")?.lang).toBe("es-CO");
    expect(pickVoice([v("en-US", true)], "es")).toBeNull();
  });
});

describe("case filters", () => {
  it("tags every project with known industries and keeps the nine deployments", () => {
    expect(featuredProjects).toHaveLength(9);
    for (const p of featuredProjects) {
      expect(p.industries.length).toBeGreaterThan(0);
      for (const i of p.industries) expect(INDUSTRIES).toContain(i);
    }
    const withBadges = featuredProjects.filter((p) => p.highlights);
    expect(withBadges.map((p) => p.id)).toEqual(["zolaris"]);
  });
});
