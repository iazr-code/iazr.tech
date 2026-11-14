"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Color } from "three";

import { TIER_SETTINGS, stepTier } from "@/lib/world/quality";
import { getTier, setTier, useTier } from "@/lib/world/tier-store";
import { CameraRig } from "@/components/world/camera-rig";
import { WorldErrorBoundary } from "@/components/world/error-boundary";
import { WorldScenes } from "@/components/world/world-scenes";

const BACKGROUND = new Color("#06080a");

// Post-procesado en un chunk aparte: low/static nunca lo descargan.
const Effects = lazy(() => import("@/components/world/effects"));

type DebugInfo = { tier: string; calls: number; triangles: number; textures: number; fps: number };
declare global {
  interface Window {
    __IAZR_WORLD__?: DebugInfo;
  }
}

/** Telemetría opt-in (?debug): draw calls, memoria de texturas y FPS reales. */
function DebugProbe() {
  const gl = useThree((s) => s.gl);
  const frames = useRef({ count: 0, since: performance.now() });
  useFrame(() => {
    const f = frames.current;
    f.count += 1;
    const now = performance.now();
    if (now - f.since < 500) return;
    window.__IAZR_WORLD__ = {
      tier: getTier(),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures,
      fps: Math.round((f.count * 1000) / (now - f.since)),
    };
    f.count = 0;
    f.since = now;
  });
  return null;
}

/**
 * Pérdida/restauración del contexto WebGL. Se suscribe con un efecto dentro del
 * Canvas (no en onCreated, que puede no ejecutarse si no llega a pintarse un frame).
 * preventDefault() permite que el navegador restaure el contexto en este canvas.
 */
function ContextWatcher({ onContextLost }: { onContextLost: (lost: boolean) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onContextLost(true);
    };
    const restored = () => onContextLost(false);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, onContextLost]);
  return null;
}

/**
 * Único <Canvas> del sitio. Vive en el layout raíz: no se remonta al navegar
 * ni al cambiar de idioma. Fijo detrás del contenido, sin eventos de puntero.
 */
export default function WorldCanvas({
  contextLost,
  onContextLost,
}: {
  contextLost: boolean;
  onContextLost: (lost: boolean) => void;
}) {
  const tier = useTier();
  const [hidden, setHidden] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    setDebug(new URLSearchParams(window.location.search).has("debug"));
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (tier === "static") return null;
  const settings = TIER_SETTINGS[tier];

  return (
    <Canvas
      aria-hidden="true"
      className="!fixed inset-0 z-0"
      // Sin contexto WebGL: bucle detenido y lienzo oculto (se ve el fondo estático).
      style={{ position: "fixed", inset: 0, pointerEvents: "none", visibility: contextLost ? "hidden" : "visible" }}
      frameloop={hidden || contextLost ? "never" : "always"}
      dpr={settings.dpr}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: tier === "high", alpha: false, powerPreference: "high-performance", stencil: false }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <color attach="background" args={[BACKGROUND]} />
      <ContextWatcher onContextLost={onContextLost} />
      <fog attach="fog" args={["#06080a", 8, 34]} />
      <PerformanceMonitor
        ms={400}
        iterations={10}
        // Banda [45, 57] a 60 Hz: con un tope de 60 el vsync nunca lo superaría y
        // el nivel no podría recuperarse tras un bache (p. ej. pestaña estrangulada).
        // Sin fallback permanente: el nivel siempre puede volver a subir.
        bounds={(refresh) => (refresh > 90 ? [50, 85] : [45, 57])}
        flipflops={Infinity}
        onDecline={() => setTier(stepTier(getTier(), "down"))}
        onIncline={() => setTier(stepTier(getTier(), "up"))}
      />
      <WorldErrorBoundary onError={() => setTier("static")}>
        <CameraRig />
        <WorldScenes />
        {settings.post !== "none" ? (
          <Suspense fallback={null}>
            <Effects mode={settings.post} />
          </Suspense>
        ) : null}
      </WorldErrorBoundary>
      {debug ? <DebugProbe /> : null}
    </Canvas>
  );
}
