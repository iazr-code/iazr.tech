"use client";

import { useEffect, useRef } from "react";

/**
 * The voice wave: 24 bars. While dictating it shows the real microphone level
 * (AnalyserNode); while the reply is spoken, a calm generated motion (the
 * browser exposes no level for synthesis). Idle, it rests as a flat line.
 */
export function VoiceWave({ analyser, active, className }: { analyser: AnalyserNode | null; active: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bins = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
    const BARS = 24;
    const levels = new Float32Array(BARS);
    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (analyser) analyser.getByteFrequencyData(bins);
      const color = getComputedStyle(c).color;
      ctx.fillStyle = color;
      const gap = 3;
      const bw = (w - gap * (BARS - 1)) / BARS;
      for (let i = 0; i < BARS; i += 1) {
        let target = 0.06;
        if (active && analyser && bins.length) {
          const idx = Math.min(bins.length - 1, Math.floor((i / BARS) * bins.length * 0.8) + 1);
          target = Math.max(0.06, bins[idx] / 255);
        } else if (active && !reduced) {
          target = 0.18 + 0.32 * Math.abs(Math.sin(now / 240 + i * 0.55)) * Math.abs(Math.sin(now / 610 + i * 0.21));
        }
        levels[i] += (target - levels[i]) * 0.3;
        const bh = Math.max(2, levels[i] * h);
        ctx.beginPath();
        ctx.roundRect(i * (bw + gap), (h - bh) / 2, bw, bh, Math.min(bw / 2, 2));
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, active]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
