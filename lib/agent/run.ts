"use client";

import { getLenis } from "@/components/providers/providers";
import { openBooking } from "@/lib/booking-store";
import { CURRENCY_RANGES, INPUT_RANGES, fitValue } from "@/lib/roi";
import { roiStore } from "@/lib/roi-store";
import { caseStore } from "@/lib/case-store";
import type { AgentAction } from "@/lib/agent/actions";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

/** Smooth scroll to a section (Lenis when it runs, native otherwise). */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { duration: 1.2 });
  else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/** Carries out one action on the page. Runs after the visitor sent the message that asked for it. */
export function runAction(action: AgentAction): void {
  switch (action.code) {
    case "booking":
      openBooking("assistant");
      return;
    case "roi": {
      const p = action.prefill;
      const current = roiStore.get();
      const currency = p.currency ?? current.currency;
      roiStore.set({
        daily: p.daily ? clamp(p.daily, INPUT_RANGES.daily.min, INPUT_RANGES.daily.max) : current.daily,
        hours: p.hours ? clamp(p.hours, INPUT_RANGES.hours.min, INPUT_RANGES.hours.max) : current.hours,
        currency,
        value: p.value ? fitValue(p.value, currency) : currency === current.currency ? current.value : CURRENCY_RANGES[currency].initial,
        prefilledBy: "agent",
      });
      scrollToSection("roi");
      return;
    }
    case "case":
      caseStore.set((s) => ({ requested: action.id, nonce: s.nonce + 1 }));
      scrollToSection("casos");
      return;
    case "flow":
      scrollToSection("flujo");
      return;
    case "portal":
      scrollToSection("contacto");
      return;
  }
}
