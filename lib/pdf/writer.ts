/**
 * A minimal PDF 1.4 writer for one-page documents: the two standard Helvetica
 * faces (no font files to embed), WinAnsi text, lines, rectangles, circles and
 * polygons. Text is written as hex strings, so the whole file stays ASCII and
 * the cross-reference offsets are plain string lengths.
 */

/* Helvetica and Helvetica-Bold advance widths (1/1000 em) for ASCII 32..126, from the Adobe AFM files. */
const REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556,
  556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611,
  611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/** WinAnsi bytes for the characters outside Latin-1 that Spanish and English copy uses. */
const WIN_ANSI_EXTRA: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97,
};
const FALLBACK: Record<string, string> = { "≥": ">=", "≤": "<=", "★": "*", "→": "->", " ": " ", " ": " " };

export type Font = "regular" | "bold";
export type RGB = [number, number, number];

/** One character to a WinAnsi byte; unsupported characters become "?". */
function byteOf(ch: string): number[] {
  if (FALLBACK[ch]) return [...FALLBACK[ch]].flatMap(byteOf);
  const code = ch.codePointAt(0) ?? 63;
  if (WIN_ANSI_EXTRA[ch] !== undefined) return [WIN_ANSI_EXTRA[ch]];
  if (code >= 32 && code <= 126) return [code];
  if (code >= 0xa0 && code <= 0xff) return [code];
  return [63];
}

export function encodeWinAnsi(text: string): number[] {
  return [...text].flatMap(byteOf);
}

/** Width of `text` in points at `size`. Accented letters take their base letter's width. */
export function textWidth(text: string, size: number, font: Font = "regular"): number {
  const table = font === "bold" ? BOLD : REGULAR;
  let units = 0;
  for (const ch of text.normalize("NFD")) {
    const code = ch.codePointAt(0) ?? 32;
    if (code >= 0x300 && code <= 0x36f) continue;
    units += code >= 32 && code <= 126 ? table[code - 32] : 556;
  }
  return (units * size) / 1000;
}

/** Greedy word wrap to `maxWidth` points. */
export function wrapText(text: string, size: number, maxWidth: number, font: Font = "regular"): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, font) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const n = (v: number) => (Math.round(v * 100) / 100).toString();
const rgb = ([r, g, b]: RGB) => `${n(r / 255)} ${n(g / 255)} ${n(b / 255)}`;
const hex = (bytes: number[]) => bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

/** Builds the page content with a top-left origin (y grows downward), in points. */
export class PdfPage {
  readonly width: number;
  readonly height: number;
  private ops: string[] = [];

  constructor(width = 595.28, height = 841.89) {
    this.width = width;
    this.height = height;
  }

  private y(v: number) {
    return this.height - v;
  }

  text(str: string, x: number, y: number, { size = 10, font = "regular" as Font, color = [6, 43, 138] as RGB } = {}) {
    this.ops.push(`BT /${font === "bold" ? "F2" : "F1"} ${n(size)} Tf ${rgb(color)} rg ${n(x)} ${n(this.y(y))} Td <${hex(encodeWinAnsi(str))}> Tj ET`);
  }

  /** Wrapped paragraph; returns the y just below its last line. */
  paragraph(str: string, x: number, y: number, maxWidth: number, opts: { size?: number; font?: Font; color?: RGB; leading?: number } = {}) {
    const size = opts.size ?? 10;
    const leading = opts.leading ?? size * 1.45;
    const lines = wrapText(str, size, maxWidth, opts.font);
    lines.forEach((line, i) => this.text(line, x, y + i * leading, { size, font: opts.font, color: opts.color }));
    return y + lines.length * leading;
  }

  rect(x: number, y: number, w: number, h: number, { fill, stroke, width = 1 }: { fill?: RGB; stroke?: RGB; width?: number }) {
    const parts = [`${n(width)} w`];
    if (fill) parts.push(`${rgb(fill)} rg`);
    if (stroke) parts.push(`${rgb(stroke)} RG`);
    parts.push(`${n(x)} ${n(this.y(y + h))} ${n(w)} ${n(h)} re ${fill && stroke ? "B" : fill ? "f" : "S"}`);
    this.ops.push(parts.join(" "));
  }

  line(x1: number, y1: number, x2: number, y2: number, { color = [6, 43, 138] as RGB, width = 1 } = {}) {
    this.ops.push(`${n(width)} w ${rgb(color)} RG 1 J ${n(x1)} ${n(this.y(y1))} m ${n(x2)} ${n(this.y(y2))} l S`);
  }

  polygon(points: [number, number][], { stroke, fill, width = 1 }: { stroke?: RGB; fill?: RGB; width?: number }) {
    const path = points.map(([x, y], i) => `${n(x)} ${n(this.y(y))} ${i === 0 ? "m" : "l"}`).join(" ");
    const paint = fill && stroke ? "b" : fill ? "f" : "s";
    this.ops.push(`${n(width)} w 1 j ${fill ? `${rgb(fill)} rg ` : ""}${stroke ? `${rgb(stroke)} RG ` : ""}${path} ${paint}`);
  }

  circle(cx: number, cy: number, r: number, fill: RGB) {
    const k = 0.5523 * r;
    const y = this.y(cy);
    this.ops.push(
      `${rgb(fill)} rg ${n(cx + r)} ${n(y)} m ` +
        `${n(cx + r)} ${n(y + k)} ${n(cx + k)} ${n(y + r)} ${n(cx)} ${n(y + r)} c ` +
        `${n(cx - k)} ${n(y + r)} ${n(cx - r)} ${n(y + k)} ${n(cx - r)} ${n(y)} c ` +
        `${n(cx - r)} ${n(y - k)} ${n(cx - k)} ${n(y - r)} ${n(cx)} ${n(y - r)} c ` +
        `${n(cx + k)} ${n(y - r)} ${n(cx + r)} ${n(y - k)} ${n(cx + r)} ${n(y)} c f`
    );
  }

  content(): string {
    return this.ops.join("\n");
  }
}

/** Serialises one page into a complete PDF file (ASCII string). */
export function renderPdf(page: PdfPage, meta: { title: string; author: string }): string {
  const content = page.content();
  const info = (s: string) => `<FEFF${[...s].map((c) => (c.codePointAt(0) ?? 63).toString(16).padStart(4, "0")).join("")}>`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(page.width)} ${n(page.height)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Title ${info(meta.title)} /Author ${info(meta.author)} /Producer (IA-ZR) >>`,
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${o.toString().padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
