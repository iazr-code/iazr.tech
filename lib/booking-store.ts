"use client";

import { useSyncExternalStore } from "react";
import posthog from "posthog-js";

/** Estado del drawer de agenda (abierto/cerrado) compartido por todos los CTAs. */
let open = false;
let lastTrigger: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openBooking(source: string): void {
  lastTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  open = true;
  emit();
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture("booking_opened", { source });
}

export function closeBooking(): void {
  open = false;
  emit();
  lastTrigger?.focus();
}

export function useBookingOpen(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false
  );
}
