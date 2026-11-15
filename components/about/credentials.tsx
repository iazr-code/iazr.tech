import { Bot, GraduationCap, ShieldCheck, Workflow } from "lucide-react";

import { certifications, diplomas, education } from "@/lib/data/experience";
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

      <div className="wrap grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="wrap mt-14">
        <p className="mb-4 t-label text-muted-foreground">
          {dict.certificationsLabel} · {certifications.reduce((n, g) => n + g.credentials.length, 0)}
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {certifications.map((group) => (
            <article key={group.id} className="card flex flex-col rounded-[var(--r-lg)] p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium tracking-[-0.015em]">{group.vendor}</h3>
                <span className="t-label shrink-0 text-muted-foreground">
                  {group.credentials.length} {dict.credentialsCount}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">{localize(group.description, locale)}</p>
              <ul className="mt-4 flex-1">
                {group.credentials.map((c) => (
                  <li key={c.name} className="border-t border-border py-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium leading-snug">{c.name}</span>
                      {c.verifyUrl ? (
                        <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="link shrink-0 text-[14px]">
                          {dict.verify}
                          <span className="sr-only">: {c.name}</span>
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[14px] text-muted-foreground">
                      {c.issuer}
                      {c.date ? ` · ${localize(c.date, locale)}` : ""}
                      {c.skills ? ` · ${c.skills.join(", ")}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mb-3 mt-10 t-label text-muted-foreground">{dict.diplomasLabel}</p>
        <ul className="grid gap-x-6 sm:grid-cols-3">
          {diplomas.map((d) => (
            <li key={d.es} className="border-t border-border py-3">
              {localize(d, locale)}
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap mt-14 grid gap-6 sm:grid-cols-2">
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
