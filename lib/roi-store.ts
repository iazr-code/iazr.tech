"use client";

import { createStore } from "@/lib/store";
import { DEFAULT_INPUTS, type RoiInputs } from "@/lib/roi";

/** The calculator's inputs, shared with the telemetry bar and the AI agent (which can prefill them). */
export const roiStore = createStore<RoiInputs & { prefilledBy: "agent" | null }>({ ...DEFAULT_INPUTS, prefilledBy: null });
