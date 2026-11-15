import { NextResponse } from "next/server";

/**
 * GET /api/health: a tiny, uncached answer. The telemetry bar times the round
 * trip to measure this site's real latency from the visitor's browser.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, t: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
