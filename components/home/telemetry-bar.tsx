"use client";

import { useEffect, useState } from "react";

import type { ModelConfig } from "@/lib/ai/model-config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { computeRoi, formatNumber } from "@/lib/roi";
import { roiStore } from "@/lib/roi-store";
import { useStore } from "@/lib/store";
import { telemetryStore } from "@/lib/telemetry-store";

type T = Dictionary["telemetry"];

/** Bogotá time (GMT-5), the founder's working clock. */
function useClock(): string {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Times a round trip to /api/health every 5 s while the bar is on screen and the tab visible. */
function useSiteLatency(root: HTMLElement | null): void {
  useEffect(() => {
    if (!root) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(root);
    const ping = async () => {
      if (!visible || document.hidden) return;
      const t0 = performance.now();
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (res.ok) telemetryStore.set({ siteLatencyMs: Math.round(performance.now() - t0) });
      } catch {
        telemetryStore.set({ siteLatencyMs: null });
      }
    };
    void ping();
    const id = window.setInterval(ping, 5000);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [root]);
}

/**
 * The live telemetry strip under the hero. Every value is real: the Bogotá
 * clock, this site's measured latency, the assistant's model and its measured
 * first response, Zolaris' verified uptime and the calculator's estimate with
 * the visitor's own numbers. It scrolls as a ticker and pauses on hover.
 */
export function TelemetryBar({ t, locale }: { t: T; locale: Locale }) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [model, setModel] = useState<ModelConfig | null>(null);
  const [online, setOnline] = useState(true);
  const clock = useClock();
  useSiteLatency(root);
  const latency = useStore(telemetryStore, (s) => s.siteLatencyMs);
  const firstToken = useStore(telemetryStore, (s) => s.firstTokenMs);
  const daily = useStore(roiStore, (s) => s.daily);
  const hours = useStore(roiStore, (s) => s.hours);
  const automationShare = useStore(roiStore, (s) => s.automationShare);
  const saved = computeRoi({ ...roiStore.get(), daily, hours, automationShare }).hoursSavedMonth;

  useEffect(() => {
    fetch("/api/chat/model", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ModelConfig | null) => d && setModel(d))
      .catch(() => undefined);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const items = [
    { k: t.clock, v: clock ? `${clock} · GMT-5` : "…" },
    { k: t.latency, v: latency === null ? "…" : `${latency} ms` },
    { k: t.model, v: model === null ? "…" : model.demo ? t.demo : `Groq · ${model.model}` },
    { k: t.firstToken, v: firstToken === null ? t.firstTokenIdle : `${formatNumber(firstToken, locale)} ms` },
    { k: t.uptime, v: t.uptimeValue },
    { k: t.saved, v: `${formatNumber(saved, locale)} ${t.savedUnit}` },
    { k: t.network, v: online ? t.online : t.offline },
  ];

  const row = (hidden: boolean) => (
    <ul className="telemetry__row" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it.k} className="telemetry__item">
          <span className="text-muted-foreground">{it.k}</span>
          <span className="font-mono text-foreground">{it.v}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={setRoot} className="telemetry" role="group" aria-label={t.label}>
      <span className="telemetry__live">
        <span className="telemetry__dot" aria-hidden="true" />
        {t.live}
      </span>
      <div className="telemetry__track" tabIndex={0}>
        <div className="telemetry__belt">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
