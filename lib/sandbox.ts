/**
 * The architecture sandbox's pipeline: a sample inbound contact goes through
 * the same four stages a Track 02 deployment runs (ingest → AI intent → routing
 * to n8n / ERP / Supabase → reporting). The inputs are sample data; the
 * processing and its timings are real (this code, measured as it runs). The AI
 * stage uses the site's deterministic intent classifier, not a paid model call.
 */
import { detectActions, parseRoiPrefill } from "@/lib/agent/actions";

export type SandboxSource = "whatsapp" | "nfc";
export type SandboxInput = { source: SandboxSource; text: string };
export type Intent = "booking" | "quote" | "review" | "info";
export type StageId = "ingest" | "ai" | "route" | "report";

export type SandboxResult = {
  id: string;
  receivedAt: string;
  source: SandboxSource;
  message: string;
  ai: { intent: Intent; confidence: number; entities: Record<string, string | number> };
  route: { workflow: string; targets: string[]; records: Record<string, Record<string, string | number>> };
  report: { dataset: string; row: Record<string, string | number> };
  timingsMs: Record<StageId | "total", number>;
};

export const SAMPLES: SandboxInput[] = [
  { source: "whatsapp", text: "Hola, ¿tienen cita para una valoración el jueves a las 10:30?" },
  { source: "nfc", text: "Escaneo NFC en mostrador: quiero dejar una reseña" },
  { source: "whatsapp", text: "Necesito cotizar la integración de 3 sedes con Siigo, unas 40 facturas al día" },
];

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function classify(text: string): { intent: Intent; confidence: number; entities: Record<string, string | number> } {
  const t = fold(text);
  const codes = detectActions(text).map((a) => a.code);
  const entities: Record<string, string | number> = {};
  const day = DAYS.find((d) => t.includes(d));
  if (day) entities.day = day;
  const time = t.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (time) entities.time = `${time[1].padStart(2, "0")}:${time[2]}`;
  const sites = t.match(/(\d+)\s*(?:sedes|sucursales|branches|sites)/);
  if (sites) entities.sites = Number(sites[1]);
  const invoices = t.match(/(\d+)\s*(?:facturas|invoices)/);
  if (invoices) entities.invoicesPerDay = Number(invoices[1]);
  const prefill = parseRoiPrefill(text);
  if (prefill.daily) entities.dailyEnquiries = prefill.daily;
  if (/siigo/.test(t)) entities.erp = "Siigo Nube";
  else if (/\bsap\b/.test(t)) entities.erp = "SAP";

  let intent: Intent = "info";
  if (/resen|review/.test(t)) intent = "review";
  else if (/cotiz|quote|integracion|integration|precio|price/.test(t) || codes.includes("roi")) intent = "quote";
  else if (codes.includes("booking") || day || time) intent = "booking";
  const signals = Object.keys(entities).length + (intent === "info" ? 0 : 1);
  const confidence = Math.min(0.98, Math.round((0.55 + signals * 0.1) * 100) / 100);
  return { intent, confidence, entities };
}

const WORKFLOWS: Record<Intent, { workflow: string; targets: string[] }> = {
  booking: { workflow: "n8n · agenda-y-recordatorio", targets: ["Google Calendar", "WhatsApp (recordatorio 24 h)", "Supabase · leads"] },
  quote: { workflow: "n8n · cotizacion-erp", targets: ["Siigo Nube · borrador de cotización", "SAP · maestro de clientes", "Supabase · oportunidades"] },
  review: { workflow: "n8n · resena-google", targets: ["Google Business · enlace de reseña", "Supabase · clientes"] },
  info: { workflow: "n8n · respuesta-ia", targets: ["WhatsApp · respuesta", "Supabase · leads"] },
};

/** Runs the four stages and measures each with `clock` (performance.now on the server). */
export function processTransaction(input: SandboxInput, clock: () => number = () => performance.now(), now = new Date()): SandboxResult {
  const t0 = clock();
  const message = input.text.replace(/\s+/g, " ").trim().slice(0, 280);
  const id = `trx_${now.getTime().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
  const t1 = clock();

  const ai = classify(message);
  const t2 = clock();

  const plan = WORKFLOWS[ai.intent];
  const records: SandboxResult["route"]["records"] = {
    supabase: { table: ai.intent === "quote" ? "opportunities" : "leads", status: ai.intent === "booking" ? "agendado" : ai.intent === "quote" ? "cotizando" : "nuevo", source: input.source },
  };
  if (ai.intent === "booking") records.calendar = { slot: `${ai.entities.day ?? "próximo hábil"} ${ai.entities.time ?? "10:30"}`, reminder: "-24h" };
  if (ai.intent === "quote") records.erp = { system: String(ai.entities.erp ?? "Siigo Nube"), document: "cotización (borrador)", lines: Number(ai.entities.sites ?? 1) };
  const t3 = clock();

  const report = {
    dataset: "Power BI · operaciones_diarias",
    row: { fecha: now.toISOString().slice(0, 10), canal: input.source, intencion: ai.intent, estado: String(records.supabase.status) },
  };
  const t4 = clock();

  const r = (v: number) => Math.round(v * 1000) / 1000;
  return {
    id,
    receivedAt: now.toISOString(),
    source: input.source,
    message,
    ai,
    route: { workflow: plan.workflow, targets: plan.targets, records },
    report,
    timingsMs: { ingest: r(t1 - t0), ai: r(t2 - t1), route: r(t3 - t2), report: r(t4 - t3), total: r(t4 - t0) },
  };
}
