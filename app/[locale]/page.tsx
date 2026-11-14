import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildJsonLdGraph } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { Timeline } from "@/components/timeline";
import { TerminalChat } from "@/components/chat/terminal-chat";
import { ContactPanel } from "@/components/contact/contact-section";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { BookingButton } from "@/components/booking/booking-button";

/**
 * Portada por idioma (SSG). Cada sección lleva `data-world-section`: la escena
 * 3D del layout raíz lee su posición para guiar la cámara.
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

  return (
    <>
      <JsonLd data={buildJsonLdGraph(locale)} />
      <HeroSection dict={dict} />
      <ServicesSection locale={locale} dict={dict} />
      <ProjectsSection locale={locale} dict={dict} />

      <section id="trayectoria" data-world-section="journey" className="px-6 py-24 sm:py-32">
        <SectionHeading eyebrow={dict.journey.eyebrow} title={dict.journey.title} description={dict.journey.description} />
        <Timeline locale={locale} dict={dict.journey} />
      </section>

      <section id="asistente" data-world-section="chat" className="px-6 py-24 sm:py-32">
        <SectionHeading eyebrow={dict.chat.eyebrow} title={dict.chat.title} description={dict.chat.description} />
        <TerminalChat dict={dict.chat} locale={locale} />
      </section>

      <section id="contacto" data-world-section="contact" className="px-6 py-24 sm:py-32">
        <SectionHeading eyebrow={dict.contact.eyebrow} title={dict.contact.title} description={dict.contact.description} />
        <ContactPanel locale={locale} dict={dict.contact}>
          <BookingButton source="contact" variant="cyber" className="w-full">
            <CalendarClock className="size-4" aria-hidden="true" />
            {dict.hero.ctaBook}
          </BookingButton>
        </ContactPanel>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
