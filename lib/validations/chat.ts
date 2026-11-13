import { z } from "zod";
import type { UIMessage } from "ai";

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

export const CHAT_LIMITS = { maxMessages: 20, maxCharsPerMessage: 2000, maxTotalChars: 12000 } as const;

export type ChatParseResult =
  | { ok: true; messages: UIMessage[]; locale: Locale }
  | { ok: false; status: 400 | 413; error: string };

const partSchema = z.looseObject({ type: z.string(), text: z.unknown().optional() });

const bodySchema = z.object({
  messages: z.array(
    z.object({
      id: z.string().max(200),
      role: z.enum(["user", "assistant"]),
      parts: z.array(partSchema).max(50),
    })
  ),
  locale: z.enum(locales).optional(),
});

// Controles C0 (salvo \t y \n), \r, DEL y C1.
const CONTROL_CHARS = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g;

function sanitize(text: string): string {
  return text.replace(CONTROL_CHARS, "").trim();
}

export function parseChatRequest(body: unknown): ChatParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const raw = (body as { messages?: unknown }).messages;
  if (Array.isArray(raw) && raw.length > CHAT_LIMITS.maxMessages) {
    return { ok: false, status: 413, error: "too_many_messages" };
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return { ok: false, status: 400, error: "invalid_body" };

  const messages: UIMessage[] = [];
  let total = 0;

  for (const m of parsed.data.messages) {
    const text = m.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => sanitize(p.text as string))
      .filter(Boolean);
    const length = text.reduce((n, t) => n + t.length, 0);
    if (length > CHAT_LIMITS.maxCharsPerMessage) {
      return { ok: false, status: 413, error: "message_too_long" };
    }
    total += length;
    if (total > CHAT_LIMITS.maxTotalChars) {
      return { ok: false, status: 413, error: "conversation_too_long" };
    }
    if (text.length === 0) continue;
    messages.push({ id: m.id, role: m.role, parts: text.map((t) => ({ type: "text", text: t })) });
  }

  if (messages.length === 0) return { ok: false, status: 400, error: "empty_conversation" };

  return { ok: true, messages, locale: parsed.data.locale ?? defaultLocale };
}
