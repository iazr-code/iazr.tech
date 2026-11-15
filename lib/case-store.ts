"use client";

import { createStore } from "@/lib/store";

/** A request to show one case (from the AI agent); `nonce` makes a repeat request fire again. */
export const caseStore = createStore<{ requested: string | null; nonce: number }>({ requested: null, nonce: 0 });
