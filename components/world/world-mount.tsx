"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { detectInitialTier, readTierEnv } from "@/lib/world/quality";
import { registerSections } from "@/lib/world/scroll-store";
import { setTier, useTier, useTierResolved } from "@/lib/world/tier-store";
import { StaticBackdrop } from "@/components/world/static-backdrop";

const WorldCanvas = dynamic(() => import("@/components/world/world-canvas"), { ssr: false });

/**
 * Punto de montaje del mundo en el layout raíz:
 * 1. Detecta el nivel de calidad inicial en el cliente.
 * 2. Carga el Canvas de forma diferida (no bloquea el primer pintado).
 * 3. Registra las secciones [data-world-section] en cada navegación.
 * 4. Muestra el fondo estático mientras carga, en "static" o sin contexto WebGL.
 */
export function WorldMount() {
  const tier = useTier();
  const resolved = useTierResolved();
  const pathname = usePathname();
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    // ?tier=high|medium|low|static fuerza un nivel (verificación y depuración).
    const forced = new URLSearchParams(window.location.search).get("tier");
    const isForced = forced === "high" || forced === "medium" || forced === "low" || forced === "static";
    setTier(isForced ? forced : detectInitialTier(readTierEnv()));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setTier(detectInitialTier(readTierEnv()));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Tras una navegación blanda el DOM nuevo ya está montado en este efecto.
    return registerSections(document.body);
  }, [pathname]);

  const showCanvas = resolved && tier !== "static";

  useEffect(() => {
    document.documentElement.dataset.world = showCanvas && !contextLost ? "3d" : "static";
  }, [showCanvas, contextLost]);

  return (
    <>
      <StaticBackdrop visible={!showCanvas || contextLost} />
      {showCanvas ? <WorldCanvas contextLost={contextLost} onContextLost={setContextLost} /> : null}
    </>
  );
}
