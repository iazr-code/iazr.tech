"use client";

import { useSyncExternalStore } from "react";

import type { QualityTier } from "@/lib/world/quality";

/** Nivel de calidad activo, observable desde React y desde useFrame. */
let tier: QualityTier = "static";
let resolved = false;
const listeners = new Set<() => void>();

export function getTier(): QualityTier {
  return tier;
}

/** true cuando el nivel ya se detectó en el cliente (antes: SSR/hidratación). */
export function isTierResolved(): boolean {
  return resolved;
}

export function setTier(next: QualityTier): void {
  resolved = true;
  if (next === tier) {
    listeners.forEach((l) => l());
    return;
  }
  tier = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTier(): QualityTier {
  return useSyncExternalStore(subscribe, getTier, () => "static");
}

export function useTierResolved(): boolean {
  return useSyncExternalStore(subscribe, isTierResolved, () => false);
}
