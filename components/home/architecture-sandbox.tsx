"use client";

import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { SandboxResult, StageId } from "@/lib/sandbox";
import { formatNumber } from "@/lib/roi";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/home/brand-icon";

type T = Dictionary["tracks"]["sandbox"];

const STAGES: { id: StageId; nodes: { icon: string; label: string }[] }[] = [
  { id: "ingest", nodes: [{ icon: "whatsapp", label: "WhatsApp" }, { icon: "ui-nfc", label: "NFC / QR" }] },
  { id: "ai", nodes: [{ icon: "ui-cpu", label: "IA · Groq" }] },
  {
    id: "route",
    nodes: [
      { icon: "n8n", label: "n8n" },
      { icon: "sap", label: "SAP" },
      { icon: "ui-receipt", label: "Siigo Nube" },
      { icon: "supabase", label: "Supabase" },
    ],
  },
  { id: "report", nodes: [{ icon: "power-bi", label: "Power BI" }, { icon: "ui-users", label: "CRM" }] },
];

const STEP_MS = 420;

/** JSON with keys, strings and numbers tinted (text tokens only, no series colours). */
function JsonView({ value }: { value: unknown }) {
  const json = JSON.stringify(value, null, 2);
  const parts = json.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|-?\d+(?:\.\d+)?)/g);
  return (
    <pre className="sandbox__json">
      {parts.map((p, i) =>
        /^".*":$/.test(p) ? (
          <span key={i} className="text-muted-foreground">{p}</span>
        ) : /^"/.test(p) ? (
          <span key={i} className="signal">{p}</span>
        ) : /^-?\d/.test(p) ? (
          <span key={i} className="font-medium">{p}</span>
        ) : (
          p
        )
      )}
    </pre>
  );
}

/**
 * Live architecture sandbox: four stages, from contact channels to reporting.
 * "Simulate a live transaction" posts a sample contact to /api/sandbox; the
 * pulse walks the stages and the inspector shows the processed JSON with the
 * server's measured stage times and the browser's measured round trip.
 */
export function ArchitectureSandbox({ t, locale }: { t: T; locale: Locale }) {
  const [running, setRunning] = useState(false);
  const [lit, setLit] = useState(-1);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [roundTrip, setRoundTrip] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [scenario, setScenario] = useState(t.scenarios[0].id);
  const [flowing, setFlowing] = useState(false);
  const flowTimer = useRef(0);

  const simulate = async (id = scenario) => {
    if (running) return;
    setRunning(true);
    setFlowing(true);
    window.clearTimeout(flowTimer.current);
    setError(false);
    setLit(0);
    const pick = t.scenarios.find((s) => s.id === id) ?? t.scenarios[0];
    const input = { source: pick.source, text: pick.text };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    try {
      const res = await fetch("/api/sandbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const rt = Math.round(performance.now() - t0);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as SandboxResult;
      // The pulse is paced for the eye; the figures shown are the measured ones.
      for (let i = 1; i < STAGES.length; i += 1) {
        if (!reduced) await new Promise((r) => setTimeout(r, STEP_MS));
        setLit(i);
      }
      setRoundTrip(rt);
      setResult(data);
    } catch {
      setError(true);
      setLit(-1);
    } finally {
      setRunning(false);
      // The wires keep pulsing a moment after the payload lands.
      flowTimer.current = window.setTimeout(() => setFlowing(false), 1600);
    }
  };

  const ms = (v: number) => `${formatNumber(v, locale, v < 10 ? 2 : 0)} ms`;

  return (
    <div className="track-card mt-6 px-8 py-8 max-sm:p-5">
      <div className="grid gap-x-6 gap-y-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[14px] font-medium text-muted-foreground">{t.eyebrow}</p>
          <h3 className="t-h3 mt-2">{t.title}</h3>
          <p className="mt-3 max-w-[60ch] text-muted-foreground">{t.body}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 lg:col-span-5 lg:items-end lg:justify-end">
          <div role="radiogroup" aria-label={t.scenariosLabel} className="flex flex-wrap gap-2 lg:justify-end">
            {t.scenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={scenario === s.id}
                disabled={running}
                onClick={() => {
                  setScenario(s.id);
                  void simulate(s.id);
                }}
                className={cn("chip", scenario === s.id && "chip--on")}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void simulate()} disabled={running} className="btn btn--primary max-sm:w-full">
            {result && !running ? <RotateCcw className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            {running ? t.running : result ? t.again : t.run}
          </button>
        </div>
      </div>

      <ol className="sandbox mt-8" aria-label={t.diagramLabel}>
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="sandbox__stage" data-on={lit >= i ? "" : undefined}>
            <p className="sandbox__label">
              <span className="font-mono">0{i + 1}</span> {t.stages[stage.id]}
            </p>
            <div className="sandbox__nodes">
              {stage.nodes.map((n) => (
                <span key={n.label} className="sandbox__node">
                  <BrandIcon name={n.icon} className="!size-7 !rounded-[7px] [&_img]:!size-[16px] [&.ic-tile--wide]:!w-10 [&.ic-tile--wide_img]:!w-8" />
                  <span className="truncate">{n.label}</span>
                </span>
              ))}
            </div>
            {i < STAGES.length - 1 ? (
              <span className="sandbox__wire" aria-hidden="true" data-pulse={flowing && lit >= i ? "" : undefined} style={{ "--delay": `${i * 140}ms` } as React.CSSProperties} />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-6" aria-live="polite">
        {error ? <p className="rounded-[var(--r-md)] bg-secondary px-4 py-3 text-[14px]">{t.error}</p> : null}
        {result ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <dl className="sandbox__timings min-w-0 lg:col-span-4">
              {(Object.keys(t.stages) as StageId[]).map((id) => (
                <div key={id} className="contents">
                  <dt className="text-muted-foreground">{t.stages[id]}</dt>
                  <dd className="font-mono">{ms(result.timingsMs[id])}</dd>
                </div>
              ))}
              <dt className="border-t border-border pt-2 font-medium">{t.serverTotal}</dt>
              <dd className="border-t border-border pt-2 font-mono font-medium">{ms(result.timingsMs.total)}</dd>
              <dt className="font-medium">{t.roundTrip}</dt>
              <dd className="font-mono font-medium">
                {roundTrip === null ? "…" : ms(roundTrip)}
                {roundTrip !== null && roundTrip < 180 ? <span className="sandbox__badge">{"< 180 ms"}</span> : null}
              </dd>
              <p className="col-span-2 mt-2 text-[13px] text-muted-foreground">{t.note}</p>
            </dl>
            <div className="min-w-0 lg:col-span-8">
              <p className="mb-2 text-[13px] font-medium text-muted-foreground">{t.inspector}</p>
              <JsonView value={result} />
            </div>
          </div>
        ) : (
          <p className={cn("text-[14px] text-muted-foreground", error && "hidden")}>{t.idle}</p>
        )}
      </div>
    </div>
  );
}
