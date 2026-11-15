import { z } from "zod";
import type { UIMessage } from "ai";

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { ACTION_CODES, type ActionCode } from "@/lib/agent/actions";

/**
 * Límites del contexto que llega al modelo:
 * · maxMessages / maxTotalChars: presupuesto del historial. Si se supera, se
 *   descartan los mensajes MÁS ANTIGUOS (la conversación sigue viva).
 * · maxCharsPerMessage: solo para lo que escribe el visitante (rol user).
 * · maxAssistantChars: las respuestas previas del asistente se recortan.
 * · maxRawMessages: por encima, el payload es abuso → 413.
 */
export const CHAT_LIMITS = {
  maxMessages: 20,
  maxCharsPerMessage: 2000,
  maxTotalChars: 12000,
  maxAssistantChars: 6000,
  maxRawMessages: 100,
} as const;

export type ChatParseResult =
  | { ok: true; messages: UIMessage[]; locale: Locale; actions: ActionCode[] }
  | { ok: false; status: 400 | 413; error: string };

const partSchema = z.looseObject({ type: z.string(), text: z.unknown().optional() });

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().max(200),
        role: z.enum(["user", "assistant"]),
        parts: z.array(partSchema).max(50),
      })
    )
    .max(CHAT_LIMITS.maxRawMessages),
  locale: z.enum(locales).optional(),
  /** Page actions the client already ran for the last message (codes only, never free text). */
  actions: z.array(z.enum(ACTION_CODES as [ActionCode, ...ActionCode[]])).max(5).optional(),
});

// Controles C0 (salvo \t y \n), \r, DEL y C1.
const CONTROL_CHARS = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g;

function sanitize(text: string): string {
  return text.replace(CONTROL_CHARS, "").trim();
}

type Clean = { id: string; role: "user" | "assistant"; text: string };

export function parseChatRequest(body: unknown): ChatParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const raw = (body as { messages?: unknown }).messages;
  if (Array.isArray(raw) && raw.length > CHAT_LIMITS.maxRawMessages) {
    return { ok: false, status: 413, error: "too_many_messages" };
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return { ok: false, status: 400, error: "invalid_body" };

  const cleaned: Clean[] = [];
  for (const m of parsed.data.messages) {
    let text = m.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => sanitize(p.text as string))
      .filter(Boolean)
      .join("\n");
    if (!text) continue;
    if (m.role === "user" && text.length > CHAT_LIMITS.maxCharsPerMessage) {
      return { ok: false, status: 413, error: "message_too_long" };
    }
    if (m.role === "assistant") text = text.slice(0, CHAT_LIMITS.maxAssistantChars);
    cleaned.push({ id: m.id, role: m.role, text });
  }

  // Presupuesto: se conserva lo más reciente que quepa.
  const kept: Clean[] = [];
  let total = 0;
  for (let i = cleaned.length - 1; i >= 0; i -= 1) {
    const m = cleaned[i];
    if (kept.length >= CHAT_LIMITS.maxMessages || total + m.text.length > CHAT_LIMITS.maxTotalChars) break;
    kept.unshift(m);
    total += m.text.length;
  }
  // El historial que ve el modelo empieza siempre por el visitante.
  while (kept.length > 0 && kept[0].role !== "user") kept.shift();

  if (kept.length === 0) return { ok: false, status: 400, error: "empty_conversation" };

  return {
    ok: true,
    messages: kept.map((m) => ({ id: m.id, role: m.role, parts: [{ type: "text", text: m.text }] })),
    locale: parsed.data.locale ?? defaultLocale,
    actions: [...new Set(parsed.data.actions ?? [])],
  };
}
