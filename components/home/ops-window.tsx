"use client";

import { useEffect, useState } from "react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";

type Window = Dictionary["hero"]["window"];

const ICON: Record<string, string> = {
  whatsapp: "whatsapp",
  calendar: "google-calendar",
  review: "google-icon",
  crm: "supabase",
};

const STEP_MS = 900;
const HOLD_MS = 2400;

/**
 * The IA-ZR Control window: operations arrive about 0.9 s apart, hold, and the
 * story plays again. It rests (everything shown) under reduced motion and
 * pauses while the tab is hidden or the window is off screen.
 */
export function OpsWindow({ t }: { t: Window }) {
  const total = t.events.length;
  const [shown, setShown] = useState(total);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    let timer = 0;
    let count = 1;
    setShown(1);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);
    const tick = () => {
      if (visible && !document.hidden) {
        count = count >= total ? 1 : count + 1;
        setShown(count);
      }
      timer = window.setTimeout(tick, count >= total ? HOLD_MS : STEP_MS);
    };
    timer = window.setTimeout(tick, STEP_MS);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [root, total]);

  return (
    <div ref={setRoot} className="window mx-auto w-full max-w-[880px] text-left" role="img" aria-label={t.label}>
      <div className="window__bar">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--p-ink)_18%,transparent)]" />
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--p-ink)_18%,transparent)]" />
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--p-ink)_18%,transparent)]" />
        </span>
        <span className="text-foreground">{t.title}</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          {t.status}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[200px_minmax(0,1fr)]">
        <ul className="hidden flex-col gap-1 border-r border-border p-3 sm:flex" aria-hidden="true">
          {t.events.map((e, i) => (
            <li
              key={e.kind}
              className="flex items-center gap-3 rounded-[10px] px-2 py-2 text-[14px] transition-colors duration-300"
              style={{ background: i === shown - 1 ? "color-mix(in oklab, var(--p-ink) 7%, transparent)" : undefined }}
            >
              <BrandIcon name={ICON[e.kind]} className="!size-8 !rounded-[8px] [&_img]:!size-[18px]" />
              <span className="truncate">{e.channel}</span>
            </li>
          ))}
        </ul>
        <ol className="flex min-w-0 flex-col gap-2 p-3 sm:p-4" aria-hidden="true">
          {t.events.map((e, i) => {
            const on = i < shown;
            return (
              <li
                key={e.kind}
                className="flex items-start gap-3 rounded-[12px] border border-border bg-background px-3 py-2.5 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
                style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)" }}
              >
                <BrandIcon name={ICON[e.kind]} className="!size-8 !rounded-[8px] [&_img]:!size-[18px]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-snug">{e.title}</span>
                  <span className="block truncate text-[14px] leading-snug text-muted-foreground">{e.detail}</span>
                </span>
                <span className="shrink-0 font-mono text-[13px] text-muted-foreground">{e.meta}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
