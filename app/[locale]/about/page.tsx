import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/data/site";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { Timeline } from "@/components/timeline";
import { AboutHeader } from "@/components/about/about-header";
import { Credentials } from "@/components/about/credentials";
import { ContactDirect } from "@/components/about/contact-direct";
import { Footer } from "@/components/footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.aboutTitle,
    description: dict.meta.aboutDescription,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { es: "/es/about", en: "/en/about", "x-default": "/en/about" },
    },
    openGraph: {
      title: `${dict.meta.aboutTitle} — IAZR`,
      description: dict.meta.aboutDescription,
      url: `/${locale}/about`,
      type: "profile",
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${siteConfig.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: dict.nav.about, item: `${siteConfig.url}/${locale}/about` },
    ],
  };

  return (
    <div className="relative">
      {/* Velo sobre el Canvas: /about prioriza la lectura. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5] bg-background/70" />
      <AboutHeader locale={locale} dict={dict.about} />
      <section className="px-6 pb-24 pt-6 sm:pb-32">
        <SectionHeading eyebrow={dict.about.journeyEyebrow} title={dict.about.journeyTitle} description={dict.about.journeyDescription} />
        <Timeline locale={locale} dict={dict.journey} />
      </section>
      <Credentials locale={locale} dict={dict.about} />
      <ContactDirect locale={locale} dict={dict.about} />
      <Footer locale={locale} dict={dict} />
      <JsonLd data={breadcrumb} />
    </div>
  );
}
