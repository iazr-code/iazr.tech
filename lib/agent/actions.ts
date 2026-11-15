/**
 * Client tool actions for the AI assistant. Each visitor message is read for
 * intents the page can carry out itself (open the booking drawer, open and
 * prefill the ROI calculator, show a case, go to the flow or the client
 * portal). Detection is deterministic and runs in the browser; the server only
 * receives the action codes so the model can mention what already happened.
 */

export type ActionCode = "booking" | "roi" | "case" | "flow" | "portal";

export type RoiPrefill = { daily?: number; hours?: number; value?: number; currency?: "USD" | "COP" };

export type AgentAction =
  | { code: "booking" }
  | { code: "roi"; prefill: RoiPrefill }
  | { code: "case"; id: string }
  | { code: "flow" }
  | { code: "portal" };

export const ACTION_CODES: readonly ActionCode[] = ["booking", "roi", "case", "flow", "portal"];

const CASES: [RegExp, string][] = [
  [/zolaris/, "zolaris"],
  [/campana/, "la-campana"],
  [/emssanar/, "emssanar-eps"],
  [/paisajes\s+sonoros/, "paisajes-sonoros"],
  [/dozurcol/, "dozurcol-pasto"],
  [/sandra|portafolio\s+sst/, "portafolio-sandra"],
  [/panini/, "panini-2026"],
  [/sonora/, "metodo-sonora"],
  [/medsys|med\s*sys/, "sst-medsys"],
];

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** "1.500", "1,500", "1500" and "2k" to numbers. */
function toNumber(raw: string): number {
  const k = /k$/i.test(raw);
  const digits = raw.replace(/k$/i, "").replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
  const v = Number.parseFloat(digits);
  return Number.isFinite(v) ? v * (k ? 1000 : 1) : NaN;
}

export function parseRoiPrefill(text: string): RoiPrefill {
  const t = fold(text);
  const out: RoiPrefill = {};
  const daily = t.match(/(\d[\d.,]*k?)\s*(?:mensajes|consultas|chats|clientes|leads|messages|enquiries|inquiries|chats?)\b/);
  if (daily) out.daily = toNumber(daily[1]);
  const hours = t.match(/(\d[\d.,]*)\s*(?:h|hrs?|horas|hours)\b/);
  if (hours) out.hours = toNumber(hours[1]);
  const money =
    t.match(/(?:\$|usd|cop)\s*(\d[\d.,]*k?)/) ?? t.match(/(\d[\d.,]*k?)\s*(?:usd|dolares|dollars|cop|pesos|mil pesos)\b/);
  if (money) {
    let value = toNumber(money[1]);
    if (/mil pesos/.test(money[0])) value *= 1000;
    out.value = value;
    out.currency = /cop|pesos/.test(money[0]) || value >= 20000 ? "COP" : "USD";
  }
  for (const key of Object.keys(out) as (keyof RoiPrefill)[]) {
    const v = out[key];
    if (typeof v === "number" && !(v > 0)) delete out[key];
  }
  return out;
}

export function detectActions(text: string): AgentAction[] {
  const t = fold(text);
  const actions: AgentAction[] = [];
  const prefill = parseRoiPrefill(text);
  const wantsRoi =
    /\broi\b|retorno|calcul|cotiz|ahorr|cuanto (?:me )?(?:cuesta|ahorro|gano)|propuesta|return on|calculat|estimate|savings|quote|proposal/.test(t) ||
    (Object.keys(prefill).length >= 2);
  if (wantsRoi) actions.push({ code: "roi", prefill });
  if (/agend|\bcita\b|reserv|diagnostico|llamada|reunion|\bbook|schedul|appointment|\bcall\b|meeting/.test(t)) actions.push({ code: "booking" });
  const hit = CASES.find(([re]) => re.test(t));
  if (hit) actions.push({ code: "case", id: hit[1] });
  else if (/\bcasos?\b|proyectos?|case stud|portfolio|projects?\b/.test(t) && /\b(ver|muestra|ensena|show|see)\b/.test(t)) actions.push({ code: "case", id: "zolaris" });
  if (/escane|escaner|camara|\bnfc\b|\bqr\b|scanner|camera/.test(t) && /\b(prob|ver|demo|try|show|muestra)/.test(t)) actions.push({ code: "flow" });
  if (/biometr|passkey|huella|face ?id|touch ?id|windows hello|webauthn|portal de clientes|client portal/.test(t)) actions.push({ code: "portal" });
  // Booking and a calculation in one message: keep both; never more than three moves at once.
  return actions.slice(0, 3);
}
