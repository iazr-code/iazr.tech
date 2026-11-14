import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";

/** Two service tracks side by side on the surface band: what each includes and who it is for. */
export function Tracks({ dict }: { dict: Dictionary }) {
  const t = dict.tracks;
  return (
    <section id="servicios" data-world-section="tracks" className="section ground-surface">
      <div className="wrap">
        <div className="grid gap-x-6 gap-y-4 lg:grid-cols-12">
          <h2 className="t-h2 lg:col-span-5">{t.title}</h2>
          <p className="t-lead self-end lg:col-span-6 lg:col-start-6">{t.lead}</p>
        </div>
        <div className="mt-12 grid gap-6 max-sm:mt-8 lg:grid-cols-2">
          {t.items.map((track) => (
            <article key={track.id} className="card flex flex-col p-8 max-sm:p-6">
              <h3 className="t-h3">{track.title}</h3>
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">{track.tag}.</span> {track.audience}
              </p>
              <ul className="mt-6 flex flex-col">
                {track.features.map((f) => (
                  <li key={f.text} className="flex min-h-12 items-center gap-4 border-t border-border py-1.5">
                    <BrandIcon name={f.icon} className="!size-8 !rounded-[8px] [&_img]:!size-[18px] [&.ic-tile--wide]:!w-12 [&.ic-tile--wide_img]:!w-9" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <a href={track.href} className="link mt-6 self-start">
                {track.cta}
                <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                  <path className="m-arrow__stem" d="M1 6h8" />
                  <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
