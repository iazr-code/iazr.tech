import { ArrowDown, ArrowRight, CalendarClock, FileText } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { BookingButton } from "@/components/booking/booking-button";

const CV_URL = "https://drive.google.com/file/d/1uXSsTCNRBIJW5D3zHWLMhyqlnwWQ69sp/view?usp=sharing";

/**
 * Hero: tipografía grande a la izquierda; la entidad de partículas 3D
 * respira detrás, a la derecha. Entrada con CSS (sin JS).
 */
export function HeroSection({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  return (
    <section
      id="inicio"
      data-world-section="hero"
      className="relative flex min-h-svh flex-col justify-center px-6 pb-24 pt-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-sm [--d:0ms]">
            <span className="size-1.5 rounded-full bg-success shadow-[0_0_10px_var(--success)]" />
            {t.status}
          </p>

          <p className="rise mt-8 font-mono text-xs uppercase tracking-[0.42em] text-primary/90 [--d:80ms]">{t.eyebrow}</p>

          <h1 className="rise mt-4 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl [--d:140ms]">
            {t.title}
          </h1>

          <p className="rise mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [--d:240ms]">
            {t.lead}
          </p>

          <div className="rise mt-10 flex flex-col gap-3 sm:flex-row [--d:320ms]">
            <BookingButton source="hero" size="lg" variant="cyber">
              <CalendarClock className="size-4" aria-hidden="true" />
              {t.ctaBook}
            </BookingButton>
            <Button variant="outline" size="lg" asChild className="border-white/15 bg-white/[0.02] backdrop-blur-sm">
              <a href="#proyectos">
                {t.ctaProjects}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <a href={CV_URL} target="_blank" rel="noopener noreferrer">
                <FileText className="size-4" aria-hidden="true" />
                {t.ctaCv}
              </a>
            </Button>
          </div>
        </div>

        <dl className="rise mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 [--d:420ms]">
          {t.stats.map((s) => (
            <div key={s.label} className="flex flex-col bg-background/70 px-5 py-5 backdrop-blur-md">
              <dt className="order-2 mt-1 text-xs text-muted-foreground">{s.label}</dt>
              <dd className="order-1 font-mono text-3xl font-semibold tracking-tight text-gradient-cyber">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        href="#servicios"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary md:flex"
      >
        {t.scroll}
        <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
