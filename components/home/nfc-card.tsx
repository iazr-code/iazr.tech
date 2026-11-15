"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, Smartphone } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { springStep } from "@/lib/world/neural";
import { enableGyro, gyroStore, initGyro } from "@/lib/world/gyro";
import { useStore } from "@/lib/store";
import { BrandMark } from "@/components/brand/brand-logo";
import { siteConfig } from "@/lib/data/site";
import { encodeQr, qrPath } from "@/lib/qr";

/** The card's mini-QR opens the IA-ZR WhatsApp, like the NFC tap does (real code, verified in tests). */
const QR = qrPath(encodeQr(siteConfig.socials.whatsapp), 2);

type T = Dictionary["tracks"]["nfc"];

/**
 * The IA-ZR NFC card in CSS 3D (ID-1 proportions, 85.6 x 54 mm). It leans
 * toward the pointer or the phone's tilt on a spring, a light sheen follows
 * it, and a tap or Enter flips it to show the antenna coil. Transform and
 * opacity only; under reduced motion it rests flat and still flips.
 */
export function NfcCard({ t }: { t: T }) {
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0, hover: false });
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const needsPermission = useStore(gyroStore, (s) => s.needsPermission);

  useEffect(() => {
    flippedRef.current = flipped;
  }, [flipped]);

  useEffect(() => {
    initGyro();
    const el = card.current;
    const host = stage.current;
    if (!el || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const s = { rx: 0, vx: 0, ry: 0, vy: 0, flip: 0, vf: 0 };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const g = gyroStore.get();
      const tx = target.current.hover ? target.current.x : g.active ? g.x : Math.sin(now / 2600) * 0.35;
      const ty = target.current.hover ? target.current.y : g.active ? g.y : Math.cos(now / 3100) * 0.2;
      const still = reduced ? 0 : 1;
      // Explicit writes, not `[s.ry, s.vy] = …`: the production minifier folded those member targets to constants.
      const lean = springStep(s.ry, s.vy, tx * 22 * still, dt, 90, 14);
      s.ry = lean[0];
      s.vy = lean[1];
      const tilt = springStep(s.rx, s.vx, -ty * 16 * still, dt, 90, 14);
      s.rx = tilt[0];
      s.vx = tilt[1];
      const flip = springStep(s.flip, s.vf, flippedRef.current ? 180 : 0, dt, 120, 17);
      s.flip = flip[0];
      s.vf = flip[1];
      el.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${(s.ry + s.flip).toFixed(2)}deg)`;
      el.style.setProperty("--sheen-x", `${50 + tx * 40}%`);
      el.style.setProperty("--sheen-y", `${50 + ty * 40}%`);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    target.current = {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
      hover: true,
    };
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={stage}
        className="nfc-stage"
        onPointerMove={onMove}
        onPointerLeave={() => (target.current.hover = false)}
      >
        <button
          type="button"
          className="nfc-hit"
          aria-pressed={flipped}
          aria-label={flipped ? t.showFront : t.showBack}
          onClick={() => setFlipped((v) => !v)}
        >
          <div ref={card} className="nfc-card">
            <div className="nfc-face nfc-face--front">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-2.5 text-[var(--c-ivory)]">
                  <BrandMark className="size-10 [--c-live:var(--c-signal)]" />
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-display text-[length:var(--t-h3)] font-semibold leading-none tracking-[-0.03em]">IA-ZR</span>
                    <span className="font-mono text-[13px] text-[var(--c-signal)]">.tech</span>
                  </span>
                </span>
                <svg viewBox="0 0 24 24" className="size-7 text-[var(--c-ivory)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 8.5a5 5 0 0 1 0 7" />
                  <path d="M9.5 6a9 9 0 0 1 0 12" />
                  <path d="M13 3.5a13 13 0 0 1 0 17" />
                </svg>
              </div>
              <div className="mt-auto flex items-end justify-between gap-3">
                <div className="min-w-0 text-left">
                  <span className="nfc-chip" aria-hidden="true" />
                  <p className="mt-3 text-base font-medium leading-tight text-[var(--c-ivory)]">{t.front}</p>
                  <p className="mt-1 font-mono text-[13px] text-[#c9d3ec]">iazr.tech</p>
                </div>
                <svg viewBox={`0 0 ${QR.size} ${QR.size}`} className="nfc-qr" role="img" aria-label={t.qrLabel} shapeRendering="crispEdges">
                  <rect width={QR.size} height={QR.size} fill="#ffffff" />
                  <path d={QR.d} fill="#062b8a" />
                </svg>
              </div>
            </div>
            <div className="nfc-face nfc-face--back">
              <svg viewBox="0 0 320 200" className="absolute inset-0 size-full" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect key={i} x={40 + i * 9} y={22 + i * 8} width={240 - i * 18} height={118 - i * 16} rx={14 - i * 2} fill="none" stroke="#062b8a" strokeOpacity={0.28} strokeWidth="2" />
                ))}
                <rect x="140" y="69" width="40" height="24" rx="4" fill="#062b8a" fillOpacity="0.85" />
              </svg>
              <p className="relative mt-auto text-left text-[14px] font-medium text-[var(--c-cobalt)]">{t.back}</p>
            </div>
            <span className="nfc-sheen" aria-hidden="true" />
          </div>
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <RotateCw className="size-4" aria-hidden="true" />
          {t.hint}
        </span>
        {needsPermission ? (
          <button type="button" onClick={() => void enableGyro()} className="link inline-flex min-h-11 items-center gap-2">
            <Smartphone className="size-4" aria-hidden="true" />
            {t.gyro}
          </button>
        ) : null}
      </div>
    </div>
  );
}
