import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";
import { NfcCard } from "@/components/home/nfc-card";
import { ArchitectureSandbox } from "@/components/home/architecture-sandbox";
import type { Locale } from "@/lib/i18n/config";

/**
 * Two service tracks on architectural white. Track 01 carries the live cobalt
 * border; under both, the band with the IA-ZR NFC card that Track 01 includes.
 */
export function Tracks({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.tracks;
  return (
    <section id="servicios" data-world-section="tracks" className="section g-white">
      <div className="wrap">
        <div className="grid gap-x-6 gap-y-4 lg:grid-cols-12">
          <h2 className="t-h2 lg:col-span-5">{t.title}</h2>
          <p className="t-lead self-end lg:col-span-6 lg:col-start-6">{t.lead}</p>
        </div>
        <div className="mt-10 grid gap-6 max-sm:mt-8 lg:grid-cols-2">
          {t.items.map((track, i) => (
            <article
              key={track.id}
              className={
                i === 0
                  ? "track-card track-card--live flex flex-col px-8 py-7 max-sm:p-6"
                  : "track-card flex flex-col px-8 py-7 max-sm:p-6"
              }
            >
              <p className="flex items-center gap-2 text-[14px] font-medium">
                {i === 0 ? <span className="size-2 rounded-full bg-[var(--c-live)]" aria-hidden="true" /> : null}
                {track.tag}
              </p>
              <h3 className="t-h3 mt-2">{track.title}</h3>
              <p className="mt-2 text-muted-foreground">{track.audience}</p>
              <ul className="mt-5 flex flex-col">
                {track.features.map((f) => (
                  <li key={f.text} className="flex min-h-11 items-center gap-4 border-t border-border py-1">
                    <BrandIcon name={f.icon} className="!size-8 !rounded-[8px] [&_img]:!size-[18px] [&.ic-tile--wide]:!w-12 [&.ic-tile--wide_img]:!w-9" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] text-muted-foreground">{track.clients}</p>
              <a href={track.href} className="link mt-3 self-start">
                {track.cta}
                <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                  <path className="m-arrow__stem" d="M1 6h8" />
                  <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
                </svg>
              </a>
            </article>
          ))}
        </div>

        <div className="track-card mt-6 grid items-center gap-x-6 gap-y-6 px-8 py-8 max-sm:p-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[14px] font-medium text-muted-foreground">{t.nfc.eyebrow}</p>
            <h3 className="t-h3 mt-2">{t.nfc.title}</h3>
            <p className="mt-3 max-w-[52ch] text-muted-foreground">{t.nfc.body}</p>
            <ul className="mt-5 grid gap-x-6 sm:grid-cols-2">
              {t.nfc.points.map((point) => (
                <li key={point} className="border-t border-border py-2.5">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <NfcCard t={t.nfc} />
          </div>
        </div>

        <ArchitectureSandbox t={t.sandbox} locale={locale} />
      </div>
    </section>
  );
}
