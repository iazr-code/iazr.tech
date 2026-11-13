import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  delete process.env.GROQ_API_KEY;
});

afterEach(() => vi.restoreAllMocks());

const { POST } = await import("@/app/api/chat/route");

function req(body: unknown, ip: string) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = { messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "hola" }] }] };

describe("POST /api/chat", () => {
  it("rejects an invalid body with 400 JSON", async () => {
    const res = await POST(req({ messages: "nope" }, "10.0.0.1"));
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await POST(req("{not json", "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("rejects more than 100 messages with 413", async () => {
    const messages = Array.from({ length: 101 }, (_, i) => ({ id: `${i}`, role: "user", parts: [{ type: "text", text: "x" }] }));
    const res = await POST(req({ messages }, "10.0.0.3"));
    expect(res.status).toBe(413);
  });

  it("returns 429 with Retry-After on the 21st request from one IP", async () => {
    for (let i = 0; i < 20; i += 1) {
      const ok = await POST(req(valid, "10.0.0.4"));
      expect(ok.status).toBe(200);
    }
    const res = await POST(req(valid, "10.0.0.4"));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  it("streams a valid request without pre-validating the model on Groq", async () => {
    process.env.GROQ_API_KEY = "gsk_test_fake";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("{}", { status: 401 }));
    const res = await POST(req(valid, "10.0.0.5"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    await res.text();
    delete process.env.GROQ_API_KEY;
    const groqModelCalls = fetchSpy.mock.calls.filter(([url]) => String(url).includes("api.groq.com/openai/v1/models"));
    expect(groqModelCalls).toHaveLength(0);
  });

  it("caps reasoning so a reasoning model never spends the whole budget and replies empty", async () => {
    process.env.GROQ_API_KEY = "gsk_test_fake";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("{}", { status: 401 }));
    const res = await POST(req(valid, "10.0.0.6"));
    await res.text();
    delete process.env.GROQ_API_KEY;
    const completion = fetchSpy.mock.calls.find(([url]) => String(url).includes("/chat/completions"));
    expect(completion).toBeDefined();
    const body = JSON.parse(String((completion![1] as RequestInit).body));
    expect(body.reasoning_effort).toBe("low");
    expect(body.max_completion_tokens ?? body.max_tokens).toBeGreaterThanOrEqual(1600);
  });
});
