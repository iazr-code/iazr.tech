"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Color } from "three";

import { TIER_SETTINGS, stepTier } from "@/lib/world/quality";
import { getTier, setTier, useTier } from "@/lib/world/tier-store";
import { CameraRig } from "@/components/world/camera-rig";
import { WorldErrorBoundary } from "@/components/world/error-boundary";
import { WorldScenes } from "@/components/world/world-scenes";

const BACKGROUND = new Color("#06080a");

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
 * Único <Canvas> del sitio. Vive en el layout raíz: no se remonta al navegar
 * ni al cambiar de idioma. Fijo detrás del contenido, sin eventos de puntero.
 */
export default function WorldCanvas({ onContextLost }: { onContextLost: (lost: boolean) => void }) {
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
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      frameloop={hidden ? "never" : "always"}
      dpr={settings.dpr}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: tier === "high", alpha: false, powerPreference: "high-performance", stencil: false }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      onCreated={({ gl, scene }) => {
        scene.background = BACKGROUND;
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost(true);
        });
        canvas.addEventListener("webglcontextrestored", () => onContextLost(false));
      }}
    >
      <fog attach="fog" args={["#06080a", 8, 34]} />
      <PerformanceMonitor
        ms={400}
        iterations={10}
        bounds={(refresh) => (refresh > 90 ? [50, 90] : [45, 60])}
        flipflops={3}
        onDecline={() => setTier(stepTier(getTier(), "down"))}
        onIncline={() => setTier(stepTier(getTier(), "up"))}
        onFallback={() => setTier("low")}
      />
      <WorldErrorBoundary onError={() => setTier("static")}>
        <CameraRig />
        <WorldScenes />
      </WorldErrorBoundary>
      {debug ? <DebugProbe /> : null}
    </Canvas>
  );
}
