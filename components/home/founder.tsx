import Link from "next/link";
import { ArrowUpRight, Award } from "lucide-react";

import { certificationCount, experience } from "@/lib/data/experience";
import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { BookingButton } from "@/components/booking/booking-button";
import { BrandIcon } from "@/components/home/brand-icon";
import { SpotlightPortrait } from "@/components/home/spotlight-portrait";

export const CV_URL = "https://drive.google.com/file/d/1uXSsTCNRBIJW5D3zHWLMhyqlnwWQ69sp/view?usp=sharing";
/** The founder portrait (from imgact.jpeg, cropped to its circle; the original is kept in public/images). */
export const PORTRAIT_SRC = "/images/ivan-zuniga.webp";

/**
 * The founder as an interactive editorial poster on soft sand: the name set
 * across the top (IVÁN in outline, ZÚÑIGA solid), the spotlight portrait
 * overlapping its base, the role and the actions on the left, the direct
 * channels as stacked pills on the right, and a band with the three recent roles.
 */
export function Founder({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.founder;
  const roles = experience.slice(0, 3);
  const certs = String(certificationCount);
  const channels = [
    { id: "linkedin", icon: <BrandIcon name="linkedin" className="!size-9 !rounded-full" />, label: "LinkedIn", meta: "/in/iazr96", href: siteConfig.socials.linkedin, external: true },
    { id: "github", icon: <BrandIcon name="github" className="!size-9 !rounded-full" />, label: "GitHub", meta: t.githubMeta, href: siteConfig.socials.github, external: true },
    { id: "instagram", icon: <BrandIcon name="instagram" className="!size-9 !rounded-full" />, label: "Instagram", meta: "@iazr.tech", href: siteConfig.socials.instagram, external: true },
    {
      id: "certs",
      icon: (
        <span className="ic-tile !size-9 !rounded-full text-[var(--c-cobalt)]">
          <Award className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </span>
      ),
      label: t.certsLabel.replace("{certs}", certs),
      meta: t.certsMeta,
      href: `/${locale}/about#credenciales`,
      external: false,
    },
  ];

  return (
    <section id="fundador" data-world-section="founder" className="section g-poster">
      <div className="wrap">
        <div className="poster">
          <h2 className="poster__name" aria-label={t.nameLabel}>
            <span className="poster__outline" aria-hidden="true">
              {t.nameA}
            </span>{" "}
            <span aria-hidden="true">{t.nameB}</span>
          </h2>

          <div className="poster__grid">
            <div className="poster__left">
              <p className="text-[clamp(20px,0.6vw+16px,24px)] font-semibold leading-snug tracking-[-0.02em] text-[var(--c-cobalt)]">{t.role}</p>
              <p className="mt-4 max-w-[46ch] text-[var(--c-slate-ink)]">{t.summary.replace("{certs}", certs)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <BookingButton source="founder" className="pill pill--solid">
                  {t.ctaCollab}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </BookingButton>
                <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="pill">
                  {t.ctaCv}
                </a>
              </div>
            </div>

            <div className="poster__portrait">
              <SpotlightPortrait src={PORTRAIT_SRC} alt={t.portraitAlt} hint={t.revealHint} />
            </div>

            <nav className="poster__right" aria-label={t.channelsLabel}>
              {channels.map((c) =>
                c.external ? (
                  <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer" className="channel-pill">
                    {c.icon}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-tight">{c.label}</span>
                      <span className="block truncate text-[13px] text-[var(--c-slate-ink)]">{c.meta}</span>
                    </span>
                    <ArrowUpRight className="channel-pill__arrow size-4" aria-hidden="true" />
                  </a>
                ) : (
                  <Link key={c.id} href={c.href} className="channel-pill">
                    {c.icon}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-tight">{c.label}</span>
                      <span className="block truncate text-[13px] text-[var(--c-slate-ink)]">{c.meta}</span>
                    </span>
                    <ArrowUpRight className="channel-pill__arrow size-4" aria-hidden="true" />
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>

        <div className="mt-14 max-lg:mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="t-label text-[var(--c-cobalt)]">{t.rolesTitle}</h3>
            <Link href={`/${locale}/about`} className="link text-[var(--c-cobalt)]">
              {t.ctaAbout}
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {roles.map((r) => (
              <li key={r.id} className="role-card">
                <p className="text-[13px] font-medium text-[var(--c-slate-ink)]">{localize(r.period, locale)}</p>
                <p className="mt-2 font-semibold leading-snug text-[var(--c-cobalt)]">{localize(r.role, locale)}</p>
                <p className="mt-1 text-[14px] text-[var(--c-slate-ink)]">{r.org}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
