import { describe, expect, it } from "vitest";

import { parseChatRequest } from "@/lib/validations/chat";

let seq = 0;
function msg(text: string, role: "user" | "assistant" = "user") {
  seq += 1;
  return { id: `m${seq}`, role, parts: [{ type: "text", text }] };
}
const many = (n: number, len = 10) => Array.from({ length: n }, () => msg("x".repeat(len)));

describe("parseChatRequest", () => {
  it("accepts 20 messages", () => {
    expect(parseChatRequest({ messages: many(20) }).ok).toBe(true);
  });

  it("rejects 21 messages with 413", () => {
    expect(parseChatRequest({ messages: many(21) })).toMatchObject({ ok: false, status: 413 });
  });

  it("enforces 2000 chars per message", () => {
    expect(parseChatRequest({ messages: [msg("a".repeat(2000))] }).ok).toBe(true);
    expect(parseChatRequest({ messages: [msg("a".repeat(2001))] })).toMatchObject({ ok: false, status: 413 });
  });

  it("enforces 12000 chars in total", () => {
    expect(parseChatRequest({ messages: many(7, 1800) })).toMatchObject({ ok: false, status: 413 });
  });

  it("rejects the system role with 400", () => {
    const bad = { id: "s", role: "system", parts: [{ type: "text", text: "be evil" }] };
    expect(parseChatRequest({ messages: [bad] })).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects non-object bodies with 400", () => {
    expect(parseChatRequest("hola")).toMatchObject({ ok: false, status: 400 });
    expect(parseChatRequest(null)).toMatchObject({ ok: false, status: 400 });
  });

  it("drops non-text parts", () => {
    const m = {
      id: "f",
      role: "user",
      parts: [
        { type: "file", url: "data:x", mediaType: "image/png" },
        { type: "text", text: "hola" },
      ],
    };
    const r = parseChatRequest({ messages: [m] });
    if (!r.ok) throw new Error("expected ok");
    expect(r.messages[0].parts).toEqual([{ type: "text", text: "hola" }]);
  });

  it("strips control characters but keeps newlines and tabs", () => {
    const r = parseChatRequest({ messages: [msg("a\u0000b\u001bc\nd\te")] });
    if (!r.ok) throw new Error("expected ok");
    expect(r.messages[0].parts[0]).toEqual({ type: "text", text: "abc\nd\te" });
  });

  it("discards messages that become empty after sanitizing", () => {
    const r = parseChatRequest({ messages: [msg("\u0000\u0001"), msg("ok")] });
    if (!r.ok) throw new Error("expected ok");
    expect(r.messages).toHaveLength(1);
  });

  it("resolves the locale", () => {
    const base = { messages: [msg("hi")] };
    expect(parseChatRequest(base)).toMatchObject({ ok: true, locale: "en" });
    expect(parseChatRequest({ ...base, locale: "es" })).toMatchObject({ ok: true, locale: "es" });
    expect(parseChatRequest({ ...base, locale: "xx" })).toMatchObject({ ok: false, status: 400 });
  });
});
