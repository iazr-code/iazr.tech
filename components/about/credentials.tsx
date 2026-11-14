import { Award, Bot, GraduationCap, ShieldCheck, Workflow } from "lucide-react";

import { certifications, education } from "@/lib/data/experience";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { SectionHeading } from "@/components/section-heading";

const CONTINUOUS = [
  { icon: Bot, tags: ["Power BI", "SQL", "Machine Learning"] },
  { icon: Workflow, tags: ["MGA", "Scrum", "CRM", "Talento TECH"] },
];

export function Credentials({ locale, dict }: { locale: Locale; dict: Dictionary["about"] }) {
  return (
    <section id="credenciales" className="py-24 sm:py-32">
      <SectionHeading eyebrow={dict.credentialsEyebrow} title={dict.credentialsTitle} description={dict.credentialsDescription} />

      <div className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {education.map((entry) => (
          <article key={entry.id} className="card flex flex-col rounded-[var(--r-lg)] p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground">
              {entry.id === "unir-ia" ? <ShieldCheck className="size-5" aria-hidden="true" /> : <GraduationCap className="size-5" aria-hidden="true" />}
            </span>
            <h3 className="mt-5 font-medium tracking-[-0.015em]">{localize(entry.degree, locale)}</h3>
            <p className="mt-1 text-[14px] text-muted-foreground">{entry.institution}</p>
            <p className="mt-3 flex-1 text-muted-foreground">{localize(entry.description, locale)}</p>
            <p className="mt-4 t-label text-muted-foreground">
              {"// " + localize(entry.period, locale)}
            </p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-5xl">
        <p className="mb-4 t-label text-muted-foreground">{dict.certificationsLabel}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((group) => (
            <article key={group.id} className="card flex flex-col rounded-[var(--r-lg)] p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                  <Award className="size-5" aria-hidden="true" />
                </span>
                <span className="t-label text-muted-foreground">
                  {group.credentials.length} {dict.credentialsCount}
                </span>
              </div>
              <h3 className="mt-5 font-medium tracking-[-0.015em]">{group.vendor}</h3>
              <p className="mt-1 text-muted-foreground">{localize(group.description, locale)}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {group.credentials.map((credential) => (
                  <li key={credential} className="flex items-start gap-2 text-sm leading-snug text-foreground/90">
                    <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {credential}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2">
        {dict.continuous.map((item, i) => {
          const { icon: Icon, tags } = CONTINUOUS[i];
          return (
            <article key={item.title} className="card flex flex-col rounded-[var(--r-lg)] p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-medium tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-3 flex-1 text-muted-foreground">{item.detail}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[14px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
