import type { RoiInputs, RoiResult } from "@/lib/roi";
import { PdfPage, renderPdf, textWidth, type RGB } from "@/lib/pdf/writer";

const COBALT: RGB = [6, 43, 138];
const MUTED: RGB = [38, 63, 142];
const LIVE: RGB = [61, 107, 255];
const IVORY: RGB = [247, 244, 237];
const LINE: RGB = [214, 220, 236];

export type ProposalLabels = {
  docTitle: string;
  preparedFor: string;
  anonymous: string;
  date: string;
  inputsTitle: string;
  inputs: { daily: string; hours: string; value: string };
  assumptionsTitle: string;
  assumptions: { lost: string; close: string; automation: string };
  resultsTitle: string;
  results: { hours: string; leads: string; revenue: string; year: string };
  trackTitle: string;
  stepsTitle: string;
  steps: string[];
  price: string;
  disclaimer: string;
  contactTitle: string;
};

export type ProposalData = {
  labels: ProposalLabels;
  inputs: RoiInputs;
  result: RoiResult;
  /** Pre-formatted figures (the page formats them in the visitor's locale). */
  figures: { daily: string; hours: string; value: string; lost: string; close: string; automation: string; hoursSaved: string; leads: string; revenue: string; revenueYear: string };
  track: { name: string; reason: string; items: string[] };
  client: string;
  date: string;
  contact: { email: string; whatsapp: string; instagram: string; site: string };
};

/** The IA-ZR mark drawn with PDF paths: hexagon, six spokes, six nodes, one live core. */
function drawMark(page: PdfPage, x: number, y: number, size: number) {
  const s = size / 32;
  const P = (px: number, py: number): [number, number] => [x + px * s, y + py * s];
  const nodes: [number, number][] = [
    [16, 3],
    [27.26, 9.5],
    [27.26, 22.5],
    [16, 29],
    [4.74, 22.5],
    [4.74, 9.5],
  ];
  page.polygon(nodes.map(([a, b]) => P(a, b)), { stroke: COBALT, width: 2 * s });
  for (const [a, b] of nodes) {
    const dx = a - 16;
    const dy = b - 16;
    const k = 4.6 / Math.hypot(dx, dy);
    const [x1, y1] = P(16 + dx * k, 16 + dy * k);
    const [x2, y2] = P(a, b);
    page.line(x1, y1, x2, y2, { color: COBALT, width: 1.2 * s });
  }
  nodes.forEach(([a, b], i) => {
    const [cx, cy] = P(a, b);
    page.circle(cx, cy, (i % 2 === 0 ? 2.2 : 1.5) * s, COBALT);
  });
  const [cx, cy] = P(16, 16);
  page.circle(cx, cy, 3 * s, LIVE);
}

/** Composes the one-page technical proposal and returns the PDF file as a string. */
export function buildProposalPdf(d: ProposalData): string {
  const page = new PdfPage();
  const M = 48;
  const W = page.width - M * 2;
  const L = d.labels;

  // Letterhead.
  drawMark(page, M, 40, 34);
  page.text("IA-ZR", M + 44, 64, { size: 20, font: "bold" });
  page.text("iazr.tech", M + 44, 78, { size: 9, color: MUTED });
  const title = L.docTitle;
  page.text(title, page.width - M - textW(title, 13, true), 60, { size: 13, font: "bold" });
  const dateLine = `${L.date}: ${d.date}`;
  page.text(dateLine, page.width - M - textW(dateLine, 9), 76, { size: 9, color: MUTED });
  page.rect(M, 92, W, 2, { fill: COBALT });

  let y = 120;
  page.text(`${L.preparedFor}: ${d.client || L.anonymous}`, M, y, { size: 11, font: "bold" });
  y += 26;

  // Inputs and assumptions, two columns.
  const col = (W - 24) / 2;
  const rows = (x: number, top: number, heading: string, items: [string, string][]) => {
    page.text(heading, x, top, { size: 10, font: "bold" });
    let yy = top + 16;
    for (const [k, v] of items) {
      page.line(x, yy - 10, x + col, yy - 10, { color: LINE, width: 0.6 });
      page.text(k, x, yy + 2, { size: 9.5, color: MUTED });
      page.text(v, x + col - textW(v, 9.5, true), yy + 2, { size: 9.5, font: "bold" });
      yy += 20;
    }
    return yy;
  };
  const yA = rows(M, y, L.inputsTitle, [
    [L.inputs.daily, d.figures.daily],
    [L.inputs.hours, d.figures.hours],
    [L.inputs.value, d.figures.value],
  ]);
  const yB = rows(M + col + 24, y, L.assumptionsTitle, [
    [L.assumptions.lost, d.figures.lost],
    [L.assumptions.close, d.figures.close],
    [L.assumptions.automation, d.figures.automation],
  ]);
  y = Math.max(yA, yB) + 14;

  // Results: four tiles on cobalt.
  page.text(L.resultsTitle, M, y, { size: 10, font: "bold" });
  y += 10;
  const tiles: [string, string][] = [
    [d.figures.hoursSaved, L.results.hours],
    [d.figures.leads, L.results.leads],
    [d.figures.revenue, L.results.revenue],
    [d.figures.revenueYear, L.results.year],
  ];
  const tw = (W - 3 * 10) / 4;
  tiles.forEach(([value, label], i) => {
    const x = M + i * (tw + 10);
    page.rect(x, y, tw, 70, { fill: COBALT });
    page.text(value, x + 12, y + 30, { size: value.length > 12 ? 13 : 16, font: "bold", color: IVORY });
    page.paragraph(label, x + 12, y + 47, tw - 24, { size: 8, color: [201, 211, 236], leading: 10 });
  });
  y += 96;

  // Recommended track.
  page.text(L.trackTitle, M, y, { size: 10, font: "bold" });
  y += 18;
  page.text(d.track.name, M, y, { size: 14, font: "bold" });
  y = page.paragraph(d.track.reason, M, y + 16, W, { size: 9.5, color: MUTED });
  y += 4;
  for (const item of d.track.items) {
    page.circle(M + 3, y - 3, 1.8, LIVE);
    y = page.paragraph(item, M + 12, y, W - 12, { size: 9.5 }) + 1;
  }
  y += 14;

  // Next steps.
  page.text(L.stepsTitle, M, y, { size: 10, font: "bold" });
  y += 16;
  d.labels.steps.forEach((step, i) => {
    page.text(`${i + 1}.`, M, y, { size: 9.5, font: "bold" });
    y = page.paragraph(step, M + 16, y, W - 16, { size: 9.5 }) + 2;
  });
  y += 6;
  page.rect(M, y, W, 28, { fill: [239, 233, 220] });
  page.text(L.price, M + 12, y + 18, { size: 9.5, font: "bold" });

  // Footer: contact and disclaimer.
  const fy = page.height - 86;
  page.rect(M, fy, W, 0.8, { fill: COBALT });
  page.text(L.contactTitle, M, fy + 18, { size: 9, font: "bold" });
  page.text(`${d.contact.email}  ·  WhatsApp ${d.contact.whatsapp}  ·  Instagram ${d.contact.instagram}  ·  ${d.contact.site}`, M, fy + 32, { size: 9 });
  page.paragraph(L.disclaimer, M, fy + 48, W, { size: 7.5, color: MUTED, leading: 10 });

  return renderPdf(page, { title: `IA-ZR · ${L.docTitle}`, author: "IA-ZR" });
}

function textW(s: string, size: number, bold = false) {
  return textWidth(s, size, bold ? "bold" : "regular");
}
