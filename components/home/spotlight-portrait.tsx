"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * The founder portrait with a "spotlight colour reveal": at rest it is a cobalt
 * duotone; under the pointer (or a finger) a soft radial mask reveals the
 * full-colour photo with a faint halo. The spotlight follows with inertia and
 * fades when the pointer leaves. Under reduced motion it jumps, no easing.
 */
export function SpotlightPortrait({ src, alt, hint }: { src: string; alt: string; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = { x: 0.5, y: 0.42, r: 0 };
    const target = { x: 0.5, y: 0.42, r: 0 };
    let raf = 0;
    let last = performance.now();
    const paint = () => {
      el.style.setProperty("--mx", `${(cur.x * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(cur.y * 100).toFixed(2)}%`);
      el.style.setProperty("--mr", `${cur.r.toFixed(1)}px`);
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
      const kr = reduced ? 1 : 1 - Math.exp(-dt * 7);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      cur.r += (target.r - cur.r) * kr;
      paint();
      const settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001 && Math.abs(target.r - cur.r) < 0.5;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const radius = () => Math.max(90, el.clientWidth * 0.36);
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
      target.r = radius();
      wake();
    };
    const leave = () => {
      target.r = 0;
      wake();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") leave();
    };
    el.addEventListener("pointerup", up);
    paint();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
      el.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div ref={ref} className="spotlight" title={hint}>
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 72vw, 380px" quality={90} className="spotlight__base" />
      <span className="spotlight__tint" aria-hidden="true" />
      <Image src={src} alt="" aria-hidden="true" fill sizes="(max-width: 640px) 72vw, 380px" quality={90} className="spotlight__colour" />
      <span className="spotlight__halo" aria-hidden="true" />
    </div>
  );
}
