"use client";

import { useSyncExternalStore } from "react";

/**
 * Install prompt state. The browser fires `beforeinstallprompt` once, when the
 * site meets its install criteria; we keep the event so any "Install app"
 * button can show the native dialog later.
 */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let started = false;
export function startPwa(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  installed = window.matchMedia("(display-mode: standalone)").matches;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
  // Dev builds re-bundle on every change: a worker there would serve stale code.
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    // React mounts after `load` has usually fired: register now in that case.
    const register = () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  emit();
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome === "accepted";
}

export function useCanInstall(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => Boolean(deferred) && !installed,
    () => false
  );
}
