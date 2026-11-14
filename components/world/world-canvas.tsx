"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";

import { TIER_SETTINGS, stepTier } from "@/lib/world/quality";
import { getTier, setTier, useTier } from "@/lib/world/tier-store";
import { frameState, readFrames, scissorBox, visibleFrame } from "@/lib/world/frames";
import { WorldErrorBoundary } from "@/components/world/error-boundary";
import { WorldScenes } from "@/components/world/world-scenes";

type DebugInfo = { tier: string; calls: number; triangles: number; textures: number; fps: number; active: boolean };
declare global {
  interface Window {
    __IAZR_WORLD__?: DebugInfo;
  }
}

/** Opt-in telemetry (?debug): draw calls, texture memory and real FPS. */
function DebugProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const frames = useRef({ count: 0, since: performance.now() });
  useEffect(() => {
    (window as unknown as { __IAZR_SCENE__?: unknown }).__IAZR_SCENE__ = { gl, scene };
  }, [gl, scene]);
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
      active: true,
    };
    f.count = 0;
    f.since = now;
  });
  return null;
}

/** WebGL context loss and restore (preventDefault lets the browser restore it on this canvas). */
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
 * Takes over rendering (priority 1): measures the [data-world-frame] boxes,
 * clears the whole buffer, then draws the scene only inside the visible frames.
 * The world can never sit behind text.
 */
function FrameRenderer() {
  useFrame(({ gl, scene, camera, size }) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const frames = readFrames();
    const rects: Record<string, (typeof frames)[number]["rect"] | undefined> = {};
    for (const f of frames) rects[f.el.dataset.worldFrame ?? ""] = f.rect;
    frameState.rects = rects;
    frameState.vw = vw;
    frameState.vh = vh;

    gl.setScissorTest(false);
    gl.clear(true, true, false);
    const union = visibleFrame(
      frames.map((f) => f.rect),
      vw,
      vh
    );
    if (!union) return;
    const dpr = gl.getPixelRatio();
    const box = scissorBox(union, vh, dpr, Math.round(size.width * dpr), Math.round(size.height * dpr));
    gl.setScissor(box.x / dpr, box.y / dpr, box.w / dpr, box.h / dpr);
    gl.setScissorTest(true);
    gl.render(scene, camera);
    gl.setScissorTest(false);
  }, 1);
  return null;
}

/** True while any world frame is on screen (checked on scroll, resize and an idle interval). */
function useFramesOnScreen(): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const next = visibleFrame(
        readFrames().map((f) => f.rect),
        window.innerWidth,
        window.innerHeight
      ) !== null;
      setOn((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const id = window.setInterval(schedule, 1000);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearInterval(id);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return on;
}

/**
 * The site's one <Canvas>, in the root layout: never remounts on navigation or
 * a language switch. Transparent and fixed behind the content; the camera is
 * fixed so planes line up with their DOM frames.
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
  const onScreen = useFramesOnScreen();

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    setDebug(new URLSearchParams(window.location.search).has("debug"));
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (tier === "static") return null;
  const settings = TIER_SETTINGS[tier];
  const running = !hidden && !contextLost && onScreen;

  return (
    <Canvas
      aria-hidden="true"
      className="!fixed inset-0 z-0"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", visibility: contextLost ? "hidden" : "visible" }}
      frameloop={running ? "always" : "never"}
      dpr={settings.dpr}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 60 }}
      gl={{ antialias: tier === "high", alpha: true, premultipliedAlpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ContextWatcher onContextLost={onContextLost} />
      <PerformanceMonitor
        ms={400}
        iterations={10}
        bounds={(refresh) => (refresh > 90 ? [50, 85] : [45, 57])}
        flipflops={Infinity}
        onDecline={() => setTier(stepTier(getTier(), "down"))}
        onIncline={() => setTier(stepTier(getTier(), "up"))}
      />
      <WorldErrorBoundary onError={() => setTier("static")}>
        <WorldScenes />
      </WorldErrorBoundary>
      <FrameRenderer />
      {debug ? <DebugProbe /> : null}
    </Canvas>
  );
}
