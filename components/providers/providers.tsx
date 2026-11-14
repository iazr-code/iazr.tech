"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

import { setScroll } from "@/lib/world/scroll-store";

/**
 * Lenis: scroll suave sobre el scroll NATIVO (no virtualiza el DOM, así que
 * teclado, anclas y lectores de pantalla siguen funcionando). Cada evento de
 * scroll alimenta la tienda del mundo 3D (progreso + velocidad).
 * Con prefers-reduced-motion no se crea Lenis: scroll nativo inmediato.
 */
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

function readNativeScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  setScroll(max > 0 ? window.scrollY / max : 0, 0);
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      readNativeScroll();
      window.addEventListener("scroll", readNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", readNativeScroll);
    }

    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.15, smoothWheel: true, touchMultiplier: 1.5 });
    lenisInstance = lenis;
    lenis.on("scroll", (l: Lenis) => setScroll(l.progress, l.velocity));
    setScroll(lenis.progress, 0);

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return children;
}
