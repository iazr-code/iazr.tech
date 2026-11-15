import { ImageResponse } from "next/og";

import type { Locale } from "@/lib/i18n/config";

export const OG_SIZE = { width: 1200, height: 630 };

const NODES: [number, number][] = [
  [16, 3],
  [27.26, 9.5],
  [27.26, 22.5],
  [16, 29],
  [4.74, 22.5],
  [4.74, 9.5],
];

const COPY: Record<Locale, { line: string; tracks: string; region: string }> = {
  es: {
    line: "Ingeniería, IA & Automatización Empresarial",
    tracks: "Agentes de IA en WhatsApp · Agenda y CRM · n8n, SAP y Siigo · Power BI",
    region: "EE. UU. y LATAM · iazr.tech",
  },
  en: {
    line: "Engineering, AI & Business Automation",
    tracks: "WhatsApp AI agents · Booking and CRM · n8n, SAP and Siigo · Power BI",
    region: "US and LATAM · iazr.tech",
  },
};

/** The share card (WhatsApp, LinkedIn, X): the hexagon mark on cobalt, the name and line on sand. */
export function renderOgImage(locale: Locale) {
  const t = COPY[locale];
  const spokes = NODES.map(([x, y]) => {
    const dx = x - 16;
    const dy = y - 16;
    const k = 4.6 / Math.hypot(dx, dy);
    return `M${(16 + dx * k).toFixed(2)} ${(16 + dy * k).toFixed(2)} ${x} ${y}`;
  }).join("");
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#eae2d3", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 420, height: "100%", background: "#062b8a" }}>
          <svg width="250" height="250" viewBox="0 0 32 32">
            <polygon points="16,3 27.26,9.5 27.26,22.5 16,29 4.74,22.5 4.74,9.5" fill="none" stroke="#f7f4ed" strokeWidth="1.6" strokeLinejoin="round" />
            <path d={spokes} stroke="#f7f4ed" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
            {NODES.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 1.9 : 1.3} fill="#f7f4ed" />
            ))}
            <circle cx="16" cy="16" r="2.8" fill="#8fb0ff" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "0 64px", color: "#062b8a" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>IA-ZR</span>
            <span style={{ fontSize: 30, color: "#263f8e" }}>.tech</span>
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 40, lineHeight: 1.15, fontWeight: 600, maxWidth: 680 }}>{t.line}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 24, lineHeight: 1.4, color: "#263f8e", maxWidth: 680 }}>{t.tracks}</div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 22, color: "#263f8e" }}>{t.region}</div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
