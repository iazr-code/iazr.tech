"use client";

import { createStore } from "@/lib/store";

/**
 * Device tilt as two values in -1..1 (x: left/right, y: forward/back). iOS asks
 * for permission, which must come from a tap, so `enableGyro` is called from a
 * button there; on other phones listening starts on its own.
 */
export const gyroStore = createStore({ x: 0, y: 0, active: false, needsPermission: false });

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma === null || e.beta === null) return;
    gyroStore.set({ x: clamp(e.gamma / 30), y: clamp((e.beta - 45) / 30), active: true });
  });
}

let initialised = false;
export function initGyro(): void {
  if (initialised || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
  initialised = true;
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  const ctor = window.DeviceOrientationEvent as OrientationCtor;
  if (typeof ctor.requestPermission === "function") {
    gyroStore.set({ needsPermission: true });
    return;
  }
  listen();
}

export async function enableGyro(): Promise<boolean> {
  const ctor = window.DeviceOrientationEvent as OrientationCtor;
  try {
    if (typeof ctor.requestPermission === "function") {
      const answer = await ctor.requestPermission();
      if (answer !== "granted") return false;
    }
    gyroStore.set({ needsPermission: false });
    listen();
    return true;
  } catch {
    return false;
  }
}
