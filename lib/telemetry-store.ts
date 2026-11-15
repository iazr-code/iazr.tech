"use client";

import { createStore } from "@/lib/store";

/** Real measurements shown in the telemetry bar (null until measured). */
export const telemetryStore = createStore<{ firstTokenMs: number | null; siteLatencyMs: number | null }>({
  firstTokenMs: null,
  siteLatencyMs: null,
});
