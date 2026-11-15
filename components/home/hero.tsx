import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fibonacciSphere } from "@/lib/world/neural";
import { BookingButton } from "@/components/booking/booking-button";
import { OpsWindow } from "@/components/home/ops-window";
import { TelemetryBar } from "@/components/home/telemetry-bar";

/** Static stand-in for the neural core (no WebGL, reduced motion): the same lattice, flattened. */
function NeuralFallback() {
  const pts = fibonacciSphere(64).filter(([, , z]) => z > -0.2);
  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="size-full" aria-hidden="true">
      <circle r="1" fill="none" stroke="currentColor" strokeWidth="0.006" opacity="0.25" />
      {pts.map(([x, y, z], i) => (
        <circle key={i} cx={x} cy={-y} r={0.012 + z * 0.012} fill="currentColor" opacity={0.25 + z * 0.6} />
      ))}
      <circle r="0.05" fill="var(--c-live)" />
    </svg>
  );
}

/**
 * Centred hero on ivory with the architectural grid: h1, lead, the main
 * action, a fact line, then a lit frame where the IA-ZR Control window floats
 * beside the WebGL neural core. The core never sits behind the words. The live
 * telemetry strip closes the screen.
 */
export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.hero;
  return (
    <section
      id="inicio"
      data-world-section="hero"
      className="g-ivory arch-grid relative flex h-[100svh] bg-transparent min-h-[700px] flex-col overflow-hidden pt-[calc(var(--nav)+48px)] max-sm:h-auto max-sm:min-h-0 max-sm:pt-[calc(var(--nav)+32px)]"
    >
      <div className="wrap flex min-h-0 flex-1 flex-col items-center text-center">
        <h1 className="enter t-h1 max-w-[16ch]">{t.title}</h1>
        <p className="enter t-lead mt-5 max-w-[58ch]" style={{ "--d": "80ms" } as React.CSSProperties}>
          {t.lead}
        </p>
        <div className="enter btn-row btn-row--stack mt-7 w-full justify-center sm:w-auto" style={{ "--d": "160ms" } as React.CSSProperties}>
          <BookingButton source="hero">
            {t.ctaBook}
            <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
              <path className="m-arrow__stem" d="M1 6h8" />
              <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
            </svg>
          </BookingButton>
          <a href="#roi" className="btn btn--secondary">
            {t.ctaRoi}
          </a>
        </div>
        <p className="enter mt-4 text-[14px] text-muted-foreground" style={{ "--d": "200ms" } as React.CSSProperties}>
          {t.pill}
        </p>

        <div
          data-world-frame="hero"
          className="enter lit-frame relative mt-8 w-full min-h-[260px] flex-1 overflow-hidden max-sm:mt-6 max-sm:h-[340px] max-sm:flex-none"
          style={{
            "--d": "240ms",
            maskImage: "linear-gradient(to bottom, var(--c-cobalt) 82%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, var(--c-cobalt) 82%, transparent)",
          } as React.CSSProperties}
        >
          <div data-neural-anchor className="hero-core" aria-hidden="true">
            <div className="hero-fallback text-foreground">
              <NeuralFallback />
            </div>
          </div>
          <div className="hero-window">
            <div className="float-card">
              <OpsWindow t={t.window} />
            </div>
          </div>
        </div>
      </div>
      <div className="wrap enter mt-4 pb-4" style={{ "--d": "320ms" } as React.CSSProperties}>
        <TelemetryBar t={dict.telemetry} locale={locale} />
      </div>
    </section>
  );
}
