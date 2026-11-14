import { CalendarClock } from "lucide-react";

import { services } from "@/lib/data/services";
import { skills } from "@/lib/data/skills";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { SectionHeading } from "@/components/section-heading";
import { BookingButton } from "@/components/booking/booking-button";
import { ServiceCard } from "@/components/sections/service-card";

/** Servicios B2B (4) + capacidades verificadas; los objetos 3D flotan detrás. */
export function ServicesSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.services;
  return (
    <section id="servicios" data-world-section="services" className="relative px-6 py-28 sm:py-36">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
        {services.map((service, i) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            index={i}
            title={localize(service.title, locale)}
            description={localize(service.description, locale)}
            outcomes={localize(service.outcomes, locale)}
            tags={service.tags}
          />
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-6xl">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.capabilitiesTitle}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <article key={skill.id} className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/5 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold tracking-tight">{localize(skill.title, locale)}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{localize(skill.description, locale)}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <BookingButton source="services" size="lg" variant="cyber">
            <CalendarClock className="size-4" aria-hidden="true" />
            {t.cta}
          </BookingButton>
        </div>
      </div>
    </section>
  );
}
