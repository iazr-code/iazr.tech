"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { ScanLine, Star } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/home/brand-icon";

type Flow = Dictionary["flow"];

// The scanner (camera, canvas analysis) loads only when the visitor opens it.
const ScannerDialog = dynamic(() => import("@/components/scanner/scanner-dialog").then((m) => m.ScannerDialog), { ssr: false });

/** Rail behind the step numbers: its cobalt fill runs from step 1 to the active step. */
function useRail(list: HTMLDivElement | null, step: number) {
  const [rail, setRail] = useState({ top: 0, length: 0, fill: 0 });
  useEffect(() => {
    if (!list) return;
    const measure = () => {
      const dots = Array.from(list.querySelectorAll<HTMLElement>("[data-step-dot]"));
      if (dots.length < 2) return;
      const base = list.getBoundingClientRect().top;
      const centre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2 - base;
      };
      const first = centre(dots[0]);
      setRail({ top: first, length: centre(dots[dots.length - 1]) - first, fill: centre(dots[step]) - first });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [list, step]);
  return rail;
}

/**
 * One customer end to end: four click-driven steps (tabs, arrow keys move
 * between them) re-render the IA-ZR Control window. Nothing advances on a timer.
 */
export function FlowSection({ t }: { t: Flow }) {
  const [step, setStep] = useState(0);
  const [scanner, setScanner] = useState(false);
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const rail = useRail(list, step);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (step + dir + t.steps.length) % t.steps.length;
    setStep(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="flujo" data-world-section="flow" className="section g-sand">
      <div className="wrap grid h-full gap-x-6 gap-y-12 max-lg:gap-y-8 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-5">
          <h2 className="t-h2">{t.title}</h2>
          <p className="t-lead mt-4">{t.lead}</p>
          <div ref={setList} role="tablist" aria-label={t.stepsLabel} aria-orientation="vertical" onKeyDown={onKey} data-edge-free className="relative mt-8 flex flex-col">
            <span aria-hidden="true" className="pointer-events-none absolute left-[15.5px] w-px bg-[var(--line-strong)]" style={{ top: rail.top, height: rail.length }}>
              <span
                className="absolute inset-x-0 top-0 h-full origin-top bg-primary transition-transform duration-500 ease-[var(--ease-out)]"
                style={{ transform: `scaleY(${rail.length ? rail.fill / rail.length : 0})` }}
              />
            </span>
            {t.steps.map((s, i) => {
              const active = i === step;
              return (
                <button
                  key={s.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`flow-tab-${i}`}
                  aria-selected={active}
                  aria-controls="flow-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setStep(i)}
                  className={cn(
                    "group grid grid-cols-[32px_1fr] gap-x-3 border-t border-border py-4 text-left transition-colors duration-200",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    data-step-dot
                    className={cn(
                      "relative z-[1] inline-grid size-8 place-items-center rounded-full font-mono text-[13px] transition-[background-color,color,box-shadow] duration-300",
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-live)_22%,transparent)]"
                        : i < step
                          ? "bg-paper text-foreground shadow-[inset_0_0_0_1.5px_var(--p-ink)]"
                          : "bg-paper"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="self-center text-base font-medium leading-snug">{s.title}</span>
                  <span
                    className="col-start-2 grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)]"
                    style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-1.5 text-muted-foreground">{s.body}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col items-start gap-2">
            <button type="button" onClick={() => setScanner(true)} className="btn btn--secondary" aria-haspopup="dialog">
              <ScanLine className="size-4" aria-hidden="true" />
              {t.scanner.open}
            </button>
            <p className="text-[14px] text-muted-foreground">{t.scanner.note}</p>
          </div>
        </div>

        <div className="lg:col-span-7 lg:self-center">
          <div id="flow-panel" role="tabpanel" aria-labelledby={`flow-tab-${step}`} className="window panel">
            <div className="window__bar">
              <BrandIcon name="whatsapp" className="!size-6 !rounded-[6px] !border-0 [&_img]:!size-[16px]" />
              <span className="whitespace-nowrap text-foreground">{t.ui.chatName}</span>
              <span className="whitespace-nowrap max-sm:hidden">· {t.ui.chatChannel}</span>
              <span className="ml-auto whitespace-nowrap max-sm:hidden">IA-ZR Control</span>
            </div>
            <div className="grid items-start gap-4 p-5 max-sm:p-4 md:grid-cols-2">
              <Chat t={t.ui} step={step} />
              <System t={t.ui} step={step} />
            </div>
          </div>
        </div>
      </div>
      {scanner ? <ScannerDialog t={t.scanner} onClose={() => setScanner(false)} /> : null}
    </section>
  );
}

/** Appears when its step is reached: the row opens (0fr → 1fr) and the content fades up, so hidden steps take no space. */
function Reveal({ on, children, className }: { on: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]"
      style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
      aria-hidden={!on}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn("transition-[opacity,transform] duration-300 ease-[var(--ease-out)]", className)}
          style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(6px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** A stage not reached yet: a dashed slot that names what will land there. */
function Pending({ on, icon, label, pending }: { on: boolean; icon: string; label: string; pending: string }) {
  return (
    <Reveal on={on} className="mt-3">
      <div className="flex h-12 items-center gap-3 rounded-[14px] border border-dashed border-[var(--line-strong)] px-4 text-[14px] text-muted-foreground">
        <BrandIcon name={icon} className="!size-6 !rounded-[6px] !border-0 opacity-60 [&_img]:!size-[15px]" />
        <span>{label}</span>
        <span className="ml-auto">{pending}</span>
      </div>
    </Reveal>
  );
}

function Chat({ t, step }: { t: Flow["ui"]; step: number }) {
  return (
    <div className="flex flex-col rounded-[14px] bg-background p-3.5 text-base leading-snug">
      <p className="self-center rounded-full bg-secondary px-3 py-1 text-[13px] text-muted-foreground">
        {t.scan} · {t.time}
      </p>
      <p className="mt-2.5 max-w-[85%] self-start rounded-[14px] rounded-tl-[4px] bg-paper px-3 py-2">
        {t.incoming}
        <span className="mt-1 block text-right font-mono text-[13px] text-muted-foreground">{t.time}</span>
      </p>
      <Reveal on={step === 0} className="ml-auto mt-2.5 w-fit">
        <p className="inline-flex items-center gap-2 rounded-[14px] rounded-tr-[4px] bg-secondary px-3 py-2 text-[14px] text-muted-foreground">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-pulse rounded-full bg-current" style={{ animationDelay: `${i * 160}ms` }} />
            ))}
          </span>
          {t.typing}
        </p>
      </Reveal>
      <Reveal on={step >= 1} className="ml-auto mt-2.5 max-w-[88%]">
        <p className="rounded-[14px] rounded-tr-[4px] bg-primary px-3 py-2 text-primary-foreground">{t.reply}</p>
      </Reveal>
      <Reveal on={step >= 2} className="mt-2.5 max-w-[85%]">
        <p className="rounded-[14px] rounded-tl-[4px] bg-paper px-3 py-2">{t.chosen}</p>
      </Reveal>
    </div>
  );
}

function System({ t, step }: { t: Flow["ui"]; step: number }) {
  return (
    <div className="flex flex-col">
      <div className="rounded-[14px] border border-border bg-background p-4">
        <p className="text-[13px] font-medium text-muted-foreground">{t.leadTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-muted-foreground">{t.leadSource}</span>
          {t.leadSources.map((src, i) => (
            <span key={src} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-[13px]">
              {i === 0 ? <BrandIcon name="whatsapp" className="!size-4 !rounded-none !border-0 !bg-transparent [&_img]:!size-[14px]" /> : <BrandIcon name="ui-nfc" className="!size-4 !rounded-none !border-0 !bg-transparent [&_svg]:!size-[14px]" />}
              {src}
            </span>
          ))}
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[14px]">
          {t.detectRows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-mono text-[13px] leading-[1.6]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <Reveal on={step >= 1} className="mt-3 border-t border-border pt-3">
          <p className="text-[13px] font-medium text-muted-foreground">{t.qualifyTitle}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[13px]">
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
      <Pending on={step < 2} icon="google-calendar" label={t.eventPending} pending={t.pending} />
      <Reveal on={step >= 2} className="mt-3 rounded-[14px] border border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <BrandIcon name="google-calendar" className="!size-9 !rounded-[8px] [&_img]:!size-[20px]" />
          <div>
            <p className="font-medium leading-snug">{t.eventTitle}</p>
            <p className="font-mono text-[13px] text-muted-foreground">{t.eventTime}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-border pt-3 text-[14px] text-muted-foreground">{t.reminder}</p>
      </Reveal>
      <Pending on={step < 3} icon="supabase" label={t.crmPending} pending={t.pending} />
      <Reveal on={step >= 3} className="mt-3 rounded-[14px] border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-[13px] font-medium">
          <BrandIcon name="supabase" className="!size-6 !rounded-[6px] !border-0 [&_img]:!size-[15px]" />
          {t.crmTitle}
        </div>
        <table className="w-full text-left text-[14px]">
          <thead className="text-muted-foreground">
            <tr>
              {t.crmCols.map((c) => (
                <th key={c} scope="col" className="px-4 pt-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {t.crmRow.map((c, i) => (
                <td key={c} className="px-4 pb-3 pt-1">
                  {i === 2 ? <span className="rounded-full bg-secondary px-2 py-0.5 text-[13px]">{c}</span> : c}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Reveal>
      <Pending on={step < 3} icon="google-icon" label={t.reviewPending} pending={t.pending} />
      <Reveal on={step >= 3} className="mt-3 rounded-[14px] border border-border bg-background p-4">
        <div className="flex items-center gap-2">
          <BrandIcon name="google-icon" className="!size-6 !rounded-[6px] !border-0 [&_img]:!size-[15px]" />
          <span className="text-[13px] font-medium">{t.reviewTitle}</span>
          <span className="ml-auto flex gap-0.5 text-[#c78a00]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-3.5 fill-current" strokeWidth={0} />
            ))}
          </span>
        </div>
        <p className="mt-2 text-[14px]">{t.reviewBody}</p>
      </Reveal>
    </div>
  );
}
