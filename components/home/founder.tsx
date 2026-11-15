import Image from "next/image";
import Link from "next/link";

import { certificationCount, experience } from "@/lib/data/experience";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";

export const CV_URL = "https://drive.google.com/file/d/1uXSsTCNRBIJW5D3zHWLMhyqlnwWQ69sp/view?usp=sharing";
/** The founder portrait (from imgact.jpeg, cropped to its circle by hand-off script; original kept in public/images). */
export const PORTRAIT_SRC = "/images/ivan-zuniga.webp";

/** The founder: portrait, credentials in sentences, three recent roles, the CV. */
export function Founder({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.founder;
  const roles = experience.slice(0, 3);

  return (
    <section id="fundador" data-world-section="founder" className="section g-warm">
      <div className="wrap grid grid-cols-1 h-full gap-x-6 gap-y-12 max-lg:gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="portrait-card">
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image src={PORTRAIT_SRC} alt={t.portraitAlt} fill sizes="(max-width: 640px) 70vw, 300px" quality={90} className="object-cover" />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:col-span-7 lg:col-start-6">
          <h2 className="t-h2">{t.title}</h2>
          <p className="t-lead mt-4 measure">{t.lead}</p>
          <p className="mt-4 measure">{t.record.replace("{certs}", String(certificationCount))}</p>

          <h3 className="t-label mt-10 text-[var(--c-cobalt)]">{t.rolesTitle}</h3>
          <ul className="mt-3">
            {roles.map((r) => (
              <li key={r.id} className="grid gap-x-6 border-t border-border py-3 sm:grid-cols-[1fr_auto]">
                <span className="font-medium">
                  {localize(r.role, locale)} <span className="font-normal text-muted-foreground">· {r.org}</span>
                </span>
                <span className="text-[14px] text-muted-foreground">{localize(r.period, locale)}</span>
              </li>
            ))}
          </ul>

          <div className="btn-row btn-row--stack mt-8">
            <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
              {t.ctaCv}
            </a>
            <Link href={`/${locale}/about`} className="link ml-2 max-sm:ml-0 max-sm:self-start">
              {t.ctaAbout}
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
