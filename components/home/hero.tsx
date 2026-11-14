import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BookingButton } from "@/components/booking/booking-button";
import { OpsWindow } from "@/components/home/ops-window";

/**
 * Centred hero: h1 on the page axis, lead, the main action, a fact line,
 * then a lit frame holding the IA-ZR Control window, fading at its foot.
 * The WebGL entity sits behind the frame, never behind the words.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  return (
    <section
      id="inicio"
      data-world-section="hero"
      className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden pt-[calc(var(--nav)+48px)] max-sm:pt-[calc(var(--nav)+40px)]"
    >
      <div className="wrap flex min-h-0 flex-1 flex-col items-center text-center">
        <h1 className="enter t-h1 max-w-[16ch]">
          {t.title}
        </h1>
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
          <a href="#servicios" className="btn btn--secondary">
            {t.ctaTracks}
          </a>
        </div>
        <p className="enter mt-4 text-[14px] text-muted-foreground" style={{ "--d": "200ms" } as React.CSSProperties}>
          {t.pill}
        </p>

        <div
          data-world-frame="hero"
          className="enter lit-frame relative mt-8 w-full min-h-[240px] flex-1 overflow-hidden px-4 pt-8 sm:px-8"
          style={{
            "--d": "240ms",
            maskImage: "linear-gradient(to bottom, var(--p-ink) 82%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, var(--p-ink) 82%, transparent)",
          } as React.CSSProperties}
        >
          <OpsWindow t={t.window} />
        </div>
      </div>
    </section>
  );
}
