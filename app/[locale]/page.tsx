import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { featuredProjects } from "@/lib/data/projects";
import { siteConfig } from "@/lib/data/site";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { buildJsonLdGraph } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { TerminalChat } from "@/components/chat/terminal-chat";
import { ContactSection } from "@/components/contact/contact-section";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/hero";
import { Problem } from "@/components/home/problem";
import { Tracks } from "@/components/home/tracks";
import { FlowSection } from "@/components/home/flow";
import { Cases } from "@/components/home/cases";
import { Founder } from "@/components/home/founder";
import { RoiSection } from "@/components/roi/roi-section";

/**
 * Home per locale (SSG). Each section carries `data-world-section`: the root
 * layout's 3D scene reads their positions to decide where it is visible.
 */

const OG_LOCALE: Record<Locale, string> = { es: "es_CO", en: "en_US" };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: { absolute: dict.meta.title },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en", "x-default": "/en" },
    },
    openGraph: { title: dict.meta.title, description: dict.meta.description, locale: OG_LOCALE[locale], url: `/${locale}` },
    twitter: { title: dict.meta.title, description: dict.meta.description },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const cases = featuredProjects.map((p) => ({
    id: p.id,
    name: p.name,
    role: localize(p.role, locale),
    year: p.year,
    description: localize(p.description, locale),
    stack: p.stack,
    href: p.href,
    hrefLabel: localize(p.hrefLabel, locale),
    image: p.image,
    imageAlt: `${dict.cases.screenshotAlt} ${p.name}`,
    results: p.results ? localize(p.results, locale) : undefined,
    highlights: p.highlights?.map((h) => ({ value: h.value, label: localize(h.label, locale) })),
    industries: p.industries,
    resultsLabel: dict.cases.resultsLabel,
  }));

  return (
    <>
      <JsonLd data={buildJsonLdGraph(locale)} />
      <Hero dict={dict} locale={locale} />
      <Problem dict={dict} />
      <Tracks dict={dict} locale={locale} />
      <FlowSection t={dict.flow} />
      <RoiSection t={dict.roi} tracks={dict.tracks} locale={locale} />
      <Cases
        items={cases}
        title={dict.cases.title}
        lead={dict.cases.lead}
        listLabel={dict.cases.listLabel}
        stackLabel={dict.cases.stack}
        filters={dict.cases.filters}
      />

      <section id="asistente" data-world-section="chat" className="section g-slate arch-grid">
        <div className="wrap grid h-full grid-cols-1 gap-x-6 gap-y-12 max-lg:gap-y-8 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <h2 className="t-h2">{dict.chat.title}</h2>
            <p className="t-lead mt-4">{dict.chat.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {dict.chat.capabilities.map((c) => (
                <li key={c} className="rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-[14px] font-medium">
                  {c}
                </li>
              ))}
            </ul>
            <h3 className="t-label mt-8 text-muted-foreground">{dict.chat.knowsTitle}</h3>
            <ul className="mt-3">
              {dict.chat.knows.map((item) => (
                <li key={item} className="border-t border-border py-3">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 text-muted-foreground max-lg:hidden">
              {dict.chat.human}{" "}
              <a href={siteConfig.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="link">
                {dict.chat.humanCta}
              </a>
            </p>
          </div>
          <div className="flex min-h-0 lg:col-span-7">
            <TerminalChat dict={dict.chat} locale={locale} />
          </div>
        </div>
      </section>

      <Founder dict={dict} locale={locale} />
      <ContactSection locale={locale} dict={dict} />
      <Footer locale={locale} dict={dict} />
    </>
  );
}
