import { Briefcase, GraduationCap } from "lucide-react";

import { education, experience } from "@/lib/data/experience";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

/**
 * Trayectoria verificable (experiencia + formación). Server Component: el
 * contenido llega como HTML; la escena 3D de trayectoria lo acompaña detrás.
 */
export function Timeline({ locale, dict }: { locale: Locale; dict: Dictionary["journey"] }) {
  const entries = [
    ...experience.map((e) => ({
      id: e.id,
      kind: "work" as const,
      role: localize(e.role, locale),
      org: e.org,
      period: localize(e.period, locale),
      description: localize(e.description, locale),
      highlights: localize(e.highlights, locale),
    })),
    ...education.map((e) => ({
      id: e.id,
      kind: "education" as const,
      role: localize(e.degree, locale),
      org: e.institution,
      period: localize(e.period, locale),
      description: localize(e.description, locale),
      highlights: [] as string[],
    })),
  ];

  return (
    <div className="wrap">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-4 w-px bg-border md:left-1/2"
        />
        <ol className="space-y-10">
          {entries.map((entry, index) => {
            const alignLeft = index % 2 === 0;
            const Icon = entry.kind === "work" ? Briefcase : GraduationCap;
            return (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-6 size-2.5 -translate-x-1/2 rounded-full bg-primary md:left-1/2"
                />
                <div className={cn("pl-12 md:w-1/2 md:pl-0", alignLeft ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12")}>
                  <article className="card rounded-[var(--r-lg)] p-6">
                    <div className={cn("flex flex-wrap items-center gap-2", alignLeft && "md:justify-end")}>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[14px] text-muted-foreground">
                        <Icon className="size-3" aria-hidden="true" />
                        <span className="sr-only">{entry.kind === "work" ? dict.work : dict.education}: </span>
                        {entry.period}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[20px] font-medium tracking-[-0.015em]">{entry.role}</h3>
                    <p className="text-[14px] text-muted-foreground">{entry.org}</p>
                    <p className="mt-3 text-muted-foreground">{entry.description}</p>
                    {entry.highlights.length > 0 ? (
                      <ul className={cn("mt-4 space-y-1.5", alignLeft && "md:ml-auto")}>
                        {entry.highlights.map((item) => (
                          <li key={item} className={cn("flex gap-2 text-[13px] leading-relaxed text-muted-foreground", alignLeft && "md:flex-row-reverse")}>
                            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
