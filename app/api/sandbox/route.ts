import { z } from "zod";

import { processTransaction } from "@/lib/sandbox";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";

/**
 * POST /api/sandbox: runs one sample transaction through the architecture
 * pipeline (lib/sandbox.ts) and returns the processed payload with its real
 * stage timings. Rate limited; inputs are short and validated.
 */
export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ limit: 30, windowMs: 600_000 });
const body = z.object({ source: z.enum(["whatsapp", "nfc"]), text: z.string().min(1).max(280) });

export async function POST(req: Request) {
  const limit = limiter.check(getClientIp(req.headers));
  if (!limit.ok) return Response.json({ error: "rate_limited" }, { status: 429 });
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: "invalid_body" }, { status: 400 });
  return Response.json(processTransaction(parsed.data), { headers: { "Cache-Control": "no-store" } });
}
