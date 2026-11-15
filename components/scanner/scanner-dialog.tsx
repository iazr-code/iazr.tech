"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Nfc, X } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { analyseFrame, frameVerdict, toLuma, type FrameStats } from "@/lib/vision";

type T = Dictionary["flow"]["scanner"];
type Mode = "sim" | "camera";

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string; cornerPoints: { x: number; y: number }[] }[]> };
type DetectorCtor = new (opts: { formats: string[] }) => Detector;

const SAMPLE_W = 160;
const SAMPLE_H = 120;

/** Corner brackets, the sweep line and an optional box, drawn over the frame. */
function drawHud(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, box: FrameStats["box"], locked: boolean) {
  const ink = locked ? "#8fb0ff" : "rgba(247,244,237,0.85)";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  const m = Math.min(w, h) * 0.12;
  const l = Math.min(w, h) * 0.08;
  const corners: [number, number, number, number][] = [
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + l * dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + l * dx, y);
    ctx.stroke();
  }
  const sweep = m + ((Math.sin(t / 700) + 1) / 2) * (h - m * 2);
  const grad = ctx.createLinearGradient(0, sweep - 24, 0, sweep);
  grad.addColorStop(0, "rgba(143,176,255,0)");
  grad.addColorStop(1, "rgba(143,176,255,0.35)");
  ctx.fillStyle = grad;
  ctx.fillRect(m, sweep - 24, w - m * 2, 24);
  ctx.fillStyle = "#8fb0ff";
  ctx.fillRect(m, sweep, w - m * 2, 1.5);
  if (box) {
    ctx.strokeStyle = "#8fb0ff";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(box.x * w, box.y * h, box.w * w, box.h * h);
    ctx.setLineDash([]);
  }
}

/**
 * The vision scanner. "Live camera" asks for the camera, analyses each frame in
 * this browser (brightness, contrast, motion, edges, QR codes where the browser
 * supports BarcodeDetector) and draws the HUD on a canvas; nothing is uploaded.
 * Without a camera or permission it falls back to an interactive simulation of
 * an NFC card tap.
 */
export function ScannerDialog({ t, onClose }: { t: T; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<Mode>("sim");
  const [notice, setNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<FrameStats | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [tapAt, setTapAt] = useState<number | null>(null);
  const [simStage, setSimStage] = useState(0);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async () => {
    setNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice(t.noCamera);
      setMode("sim");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      stream.current = media;
      const v = video.current;
      if (v) {
        v.srcObject = media;
        await v.play().catch(() => undefined);
      }
      setMode("camera");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setNotice(name === "NotAllowedError" ? t.denied : t.noCamera);
      setMode("sim");
    }
  };

  // Drawing loop for both modes.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const sample = document.createElement("canvas");
    sample.width = SAMPLE_W;
    sample.height = SAMPLE_H;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    let prev: Float32Array | null = null;
    let raf = 0;
    let lastStats = 0;
    let lastDetect = 0;
    const Ctor = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    const detector = mode === "camera" && Ctor ? new Ctor({ formats: ["qr_code"] }) : null;
    let box: FrameStats["box"] = null;

    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const w = c.clientWidth;
      const h = c.clientHeight;
      const v = video.current;
      if (mode === "camera" && v && v.readyState >= 2) {
        const vr = v.videoWidth / v.videoHeight;
        const cr = w / h;
        const dw = vr > cr ? h * vr : w;
        const dh = vr > cr ? h : w / vr;
        ctx.drawImage(v, (w - dw) / 2, (h - dh) / 2, dw, dh);
        if (sctx && now - lastStats > 120) {
          lastStats = now;
          sctx.drawImage(v, 0, 0, SAMPLE_W, SAMPLE_H);
          const luma = toLuma(sctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);
          const s = analyseFrame(luma, prev, SAMPLE_W, SAMPLE_H);
          prev = luma;
          box = s.box;
          setStats(s);
        }
        if (detector && now - lastDetect > 400) {
          lastDetect = now;
          detector
            .detect(v)
            .then((found) => setCode(found[0]?.rawValue ?? null))
            .catch(() => undefined);
        }
        drawHud(ctx, w, h, now, box, false);
        return;
      }
      // Simulation: a counter top, the IA-ZR card sliding in toward the reader.
      ctx.fillStyle = "#0b2159";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(247,244,237,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      const since = tapAt === null ? -1 : now - tapAt;
      const p = since < 0 ? 0 : Math.min(1, since / 700);
      const ease = 1 - Math.pow(1 - p, 3);
      const cw = Math.min(w * 0.5, 260);
      const ch = cw / 1.585;
      const cx = w / 2 - cw / 2;
      const cy = h * (0.95 - ease * 0.45) - ch / 2 + Math.sin(now / 900) * 3;
      ctx.fillStyle = "#0a3299";
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 14);
      ctx.fill();
      ctx.fillStyle = "#f7f4ed";
      ctx.font = "500 18px system-ui, sans-serif";
      ctx.fillText("IA-ZR", cx + 18, cy + 32);
      ctx.strokeStyle = "#8fb0ff";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(cx + cw - 30, cy + 26, 6 + i * 5, -0.7, 0.7);
        ctx.stroke();
      }
      const locked = p >= 1;
      drawHud(ctx, w, h, now, locked ? { x: cx / w, y: cy / h, w: cw / w, h: ch / h } : null, locked);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, tapAt]);

  // Simulation stages after a tap: detected → opening WhatsApp → contact created.
  useEffect(() => {
    if (tapAt === null) return;
    setSimStage(0);
    const timers = [800, 1700, 2600].map((ms, i) => window.setTimeout(() => setSimStage(i + 1), ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [tapAt]);

  const close = () => {
    stopCamera();
    dialog.current?.close();
  };

  const verdict = stats ? frameVerdict(stats) : null;
  const pct = (v: number) => `${Math.round(v * 100)} %`;

  return (
    <dialog
      ref={dialog}
      data-lenis-prevent
      aria-labelledby="scanner-title"
      onClose={() => {
        stopCamera();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="scanner-dialog g-night m-auto w-[min(100%-32px,880px)] max-w-none rounded-[var(--r-lg)] border border-border p-0"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 max-sm:px-4">
        <div>
          <h2 id="scanner-title" className="font-display text-xl font-medium tracking-[-0.015em]">
            {t.title}
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground">{t.privacy}</p>
        </div>
        <button type="button" onClick={close} aria-label={t.close} className="btn btn--secondary size-11 shrink-0 !p-0">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_260px]">
        <div className="relative aspect-[4/3] bg-[#05153f]">
          <canvas ref={canvas} className="absolute inset-0 size-full" aria-label={mode === "camera" ? t.cameraLabel : t.simLabel} role="img" />
          <video ref={video} className="pointer-events-none absolute left-0 top-0 size-px opacity-0" playsInline muted aria-hidden="true" />
          <span className="absolute left-3 top-3 rounded-full bg-[rgba(5,21,63,0.72)] px-2.5 py-1 font-mono text-[13px] text-[var(--c-ivory)]">
            {mode === "camera" ? t.liveTag : t.simTag}
          </span>
        </div>
        <div className="flex flex-col gap-4 border-t border-border p-5 md:border-l md:border-t-0">
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => void startCamera()} className="btn btn--primary" disabled={mode === "camera"}>
              <Camera className="size-4" aria-hidden="true" />
              {t.camera}
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode("sim");
                setTapAt(performance.now());
              }}
              className="btn btn--secondary"
            >
              <Nfc className="size-4" aria-hidden="true" />
              {t.tap}
            </button>
          </div>
          {notice ? (
            <p role="status" className="rounded-[var(--r-sm)] bg-secondary px-3 py-2 text-[14px]">
              {notice}
            </p>
          ) : null}
          {mode === "camera" ? (
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-[14px]">
              <dt className="text-muted-foreground">{t.brightness}</dt>
              <dd className="font-mono">{stats ? Math.round(stats.brightness) : "…"}</dd>
              <dt className="text-muted-foreground">{t.contrast}</dt>
              <dd className="font-mono">{stats ? Math.round(stats.contrast) : "…"}</dd>
              <dt className="text-muted-foreground">{t.motion}</dt>
              <dd className="font-mono">{stats ? pct(stats.motion) : "…"}</dd>
              <dt className="text-muted-foreground">{t.edges}</dt>
              <dd className="font-mono">{stats ? pct(stats.edges) : "…"}</dd>
              <dt className="text-muted-foreground">{t.state}</dt>
              <dd className="font-mono signal">{verdict ? t.verdicts[verdict] : "…"}</dd>
              <dt className="text-muted-foreground">QR</dt>
              <dd className="max-w-[140px] truncate font-mono" title={code ?? undefined}>
                {code ?? t.noCode}
              </dd>
            </dl>
          ) : (
            <ol className="flex flex-col gap-2 text-[14px]" aria-live="polite">
              {t.simSteps.map((label, i) => {
                const done = tapAt !== null && simStage > i;
                return (
                  <li key={label} className="flex items-center gap-2" style={{ opacity: done ? 1 : 0.5 }}>
                    <span className="size-2 rounded-full" style={{ background: done ? "var(--c-signal)" : "var(--line-strong)" }} aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </dialog>
  );
}
