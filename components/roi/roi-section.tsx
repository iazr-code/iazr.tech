"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarCheck, CreditCard, FileDown, Landmark, Coins, ChevronDown } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/data/site";
import { openBooking } from "@/lib/booking-store";
import { checkoutHref, type PayMethod } from "@/lib/checkout";
import { CURRENCY_RANGES, INPUT_RANGES, computeRoi, formatMoney, formatNumber, type Currency } from "@/lib/roi";
import { roiStore } from "@/lib/roi-store";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { on, PAGE_EVENTS } from "@/lib/events";
import { scrollToSection } from "@/lib/agent/run";

type T = Dictionary["roi"];

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="border-t border-border py-4">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-base signal">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="roi-range mt-3 w-full"
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}

/** Twelve bars of cumulative recovered revenue; hover or focus a bar for its value. Single series, so no legend. */
function CumulativeChart({ values, currency, locale, t }: { values: number[]; currency: Currency; locale: Locale; t: T }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const shown = hover ?? values.length - 1;
  return (
    <figure className="mt-6">
      <figcaption className="flex items-baseline justify-between gap-4 text-[14px]">
        <span className="text-muted-foreground">{t.chartTitle}</span>
        <span className="font-mono">
          {t.month} {shown + 1}: {formatMoney(values[shown], currency, locale)}
        </span>
      </figcaption>
      <div className="mt-3 flex h-36 items-end gap-[2px] border-b border-[var(--line-strong)]" onPointerLeave={() => setHover(null)} aria-hidden="true">
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
            <div
              className="roi-bar w-full"
              style={{ height: `${Math.max(1.5, (v / max) * 100)}%`, opacity: hover === null || hover === i ? 1 : 0.45 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[13px] text-muted-foreground" aria-hidden="true">
        <span>{t.month} 1</span>
        <span>{t.month} 12</span>
      </div>
      <div className="sr-only">
      <table>
        <caption>{t.chartTitle}</caption>
        <tbody>
          {values.map((v, i) => (
            <tr key={i}>
              <th scope="row">
                {t.month} {i + 1}
              </th>
              <td>{formatMoney(v, currency, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

/**
 * The ROI calculator on engineering cobalt: three sliders and three visible
 * assumptions drive a live estimate, a 12-month chart, the recommended track,
 * a one-page PDF proposal built in the browser, and the ways to reserve.
 */
export function RoiSection({ t, tracks, locale }: { t: T; tracks: Dictionary["tracks"]; locale: Locale }) {
  const inputs = useStore(roiStore, (s) => s);
  const result = computeRoi(inputs);
  const [client, setClient] = useState("");
  const [reserve, setReserve] = useState(false);
  const [flash, setFlash] = useState(false);
  const range = CURRENCY_RANGES[inputs.currency];
  const money = (v: number) => formatMoney(v, inputs.currency, locale);
  const pct = (v: number) => `${Math.round(v * 100)} %`;

  // Briefly mark the panel when the assistant prefilled it.
  useEffect(() => {
    if (inputs.prefilledBy !== "agent") return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 1600);
    return () => window.clearTimeout(id);
  }, [inputs.prefilledBy, inputs.daily, inputs.hours, inputs.value]);

  const set = (patch: Partial<typeof inputs>) => roiStore.set({ ...patch, prefilledBy: null });
  const trackName = t.tracks[result.track];
  const trackItems =
    result.track === "via02"
      ? tracks.items[1].features.map((f) => f.text)
      : result.track === "via01"
        ? tracks.items[0].features.map((f) => f.text)
        : [...tracks.items[0].features.slice(0, 3), ...tracks.items[1].features.slice(0, 3)].map((f) => f.text);

  const summary = t.message
    .replace("{track}", trackName)
    .replace("{hours}", formatNumber(result.hoursSavedMonth, locale))
    .replace("{revenue}", money(result.revenueMonth));

  const downloadPdf = async () => {
    const { buildProposalPdf } = await import("@/lib/pdf/proposal");
    const date = new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en-US", { dateStyle: "long" }).format(new Date());
    const pdf = buildProposalPdf({
      labels: t.pdf,
      inputs,
      result,
      figures: {
        daily: formatNumber(inputs.daily, locale),
        hours: formatNumber(inputs.hours, locale),
        value: money(inputs.value),
        lost: pct(inputs.lostShare),
        close: pct(inputs.closeShare),
        automation: pct(inputs.automationShare),
        hoursSaved: `${formatNumber(result.hoursSavedMonth, locale)} h`,
        leads: formatNumber(result.recoveredLeadsMonth, locale),
        revenue: money(result.revenueMonth),
        revenueYear: money(result.revenueYear),
      },
      track: { name: trackName, reason: t.reasons[result.track], items: trackItems },
      client: client.trim().slice(0, 80),
      date,
      contact: { email: siteConfig.author.email, whatsapp: siteConfig.author.whatsappDisplay, instagram: "@iazr.tech", site: "iazr.tech" },
    });
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = t.pdf.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // Command palette: "download the proposal" scrolls here and builds the PDF.
  const pdfRef = useRef(downloadPdf);
  useEffect(() => {
    pdfRef.current = downloadPdf;
  });
  useEffect(
    () =>
      on(PAGE_EVENTS.roiPdf, () => {
        scrollToSection("roi");
        void pdfRef.current();
      }),
    []
  );

  const pay: { id: PayMethod; label: string; icon: typeof CreditCard }[] = [
    { id: "card", label: t.pay.card, icon: CreditCard },
    { id: "pse", label: t.pay.pse, icon: Landmark },
    { id: "crypto", label: t.pay.crypto, icon: Coins },
  ];

  return (
    <section id="roi" data-world-section="roi" className="section g-engine arch-grid">
      <div className="wrap grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="t-h2">{t.title}</h2>
          <p className="t-lead mt-4">{t.lead}</p>
          <div className="mt-8">
            <Slider
              label={t.inputs.daily}
              value={inputs.daily}
              {...INPUT_RANGES.daily}
              display={formatNumber(inputs.daily, locale)}
              onChange={(v) => set({ daily: v })}
            />
            <Slider
              label={t.inputs.hours}
              value={inputs.hours}
              {...INPUT_RANGES.hours}
              display={`${inputs.hours} h`}
              onChange={(v) => set({ hours: v })}
            />
            <Slider
              label={t.inputs.value}
              value={inputs.value}
              min={range.min}
              max={range.max}
              step={range.step}
              display={money(inputs.value)}
              onChange={(v) => set({ value: v })}
            />
            <div className="flex items-center justify-between gap-4 border-t border-border py-3">
              <span className="text-[14px] text-muted-foreground">{t.currency}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={t.currency}>
                {(["USD", "COP"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={inputs.currency === c}
                    onClick={() => set({ currency: c, value: inputs.currency === c ? inputs.value : CURRENCY_RANGES[c].initial })}
                    className={cn("btn !h-9 !px-3 font-mono !text-[14px]", inputs.currency === c ? "btn--primary" : "btn--secondary")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <details className="roi-details group border-t border-border">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {t.assumptionsTitle}
                <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-2 text-[14px] text-muted-foreground">{t.assumptionsNote}</p>
              <Slider label={t.assumptions.lost} value={Math.round(inputs.lostShare * 100)} min={0} max={40} step={1} display={pct(inputs.lostShare)} onChange={(v) => set({ lostShare: v / 100 })} />
              <Slider label={t.assumptions.close} value={Math.round(inputs.closeShare * 100)} min={5} max={60} step={1} display={pct(inputs.closeShare)} onChange={(v) => set({ closeShare: v / 100 })} />
              <Slider label={t.assumptions.automation} value={Math.round(inputs.automationShare * 100)} min={20} max={90} step={5} display={pct(inputs.automationShare)} onChange={(v) => set({ automationShare: v / 100 })} />
            </details>
          </div>
        </div>

        <div className={cn("roi-panel lg:col-span-7", flash && "roi-panel--flash")} aria-live="polite">
          {inputs.prefilledBy === "agent" ? <p className="mb-4 inline-flex rounded-full bg-secondary px-3 py-1 text-[13px]">{t.prefilled}</p> : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="roi-tile">
              <p className="text-[14px] text-muted-foreground">{t.results.hours}</p>
              <p className="roi-figure">{formatNumber(result.hoursSavedMonth, locale)} h</p>
            </div>
            <div className="roi-tile">
              <p className="text-[14px] text-muted-foreground">{t.results.revenue}</p>
              <p className="roi-figure">{money(result.revenueMonth)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {formatNumber(result.recoveredCustomersMonth, locale, 1)} {t.results.customers}
              </p>
            </div>
            <div className="roi-tile">
              <p className="text-[14px] text-muted-foreground">{t.results.track}</p>
              <p className="roi-figure !text-[22px]">{trackName}</p>
            </div>
          </div>
          <p className="mt-4 text-[14px] text-muted-foreground">{t.reasons[result.track]}</p>

          <CumulativeChart values={result.cumulative} currency={inputs.currency} locale={locale} t={t} />
          <p className="mt-4 text-[13px] text-muted-foreground">{t.disclaimer}</p>

          <div className="mt-6 border-t border-border pt-5">
            <label className="block text-[14px] text-muted-foreground" htmlFor="roi-client">
              {t.clientLabel}
            </label>
            <input
              id="roi-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              maxLength={80}
              placeholder={t.clientPlaceholder}
              autoComplete="organization"
              className="mt-2 h-12 w-full rounded-[var(--r-sm)] border border-input bg-paper px-4 text-base text-foreground outline-none focus-visible:border-[var(--c-signal)]"
            />
            <div className="btn-row btn-row--stack mt-4">
              <button type="button" onClick={() => void downloadPdf()} className="btn btn--primary">
                <FileDown className="size-4" aria-hidden="true" />
                {t.download}
              </button>
              <button type="button" onClick={() => setReserve((v) => !v)} aria-expanded={reserve} aria-controls="roi-reserve" className="btn btn--secondary">
                {t.reserve}
              </button>
            </div>
          </div>

          <div
            id="roi-reserve"
            className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]"
            style={{ gridTemplateRows: reserve ? "1fr" : "0fr" }}
            inert={!reserve}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid gap-2 pt-4 sm:grid-cols-2">
                <button type="button" onClick={() => openBooking("roi")} className="roi-option">
                  <CalendarCheck className="size-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-medium">{t.pay.book}</span>
                    <span className="block text-[13px] text-muted-foreground">{t.pay.bookNote}</span>
                  </span>
                </button>
                {pay.map((m) => {
                  const { href, direct } = checkoutHref(m.id, `${summary} ${t.pay.method}: ${m.label}.`);
                  const Icon = m.icon;
                  return (
                    <a key={m.id} href={href} target="_blank" rel="noopener noreferrer" className="roi-option">
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block font-medium">{m.label}</span>
                        <span className="block text-[13px] text-muted-foreground">{direct ? t.pay.direct : t.pay.viaWhatsapp}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">{t.pay.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
