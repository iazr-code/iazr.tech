import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import { certifications, education } from "@/lib/data/experience";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";

const LANGUAGE_TAG: Record<Locale, string> = { es: "es-CO", en: "en-US" };

/**
 * Schema.org graph for the home page, rendered on the server: the agency
 * (Organization), the service it sells (ProfessionalService with both tracks),
 * its founder (Person, with the 15 verifiable certifications and the current
 * portrait) and the WebSite. Every value comes from the site's own data.
 */

const ORG_ID = `${siteConfig.url}/#organization`;
const SERVICE_ID = `${siteConfig.url}/#service`;
const PERSON_ID = `${siteConfig.url}/#founder`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export const PORTRAIT_URL = `${siteConfig.url}/images/ivan-zuniga.jpg`;
export const LOGO_URL = `${siteConfig.url}/pwa/icon-512.png`;

const SAME_AS = [siteConfig.socials.instagram, siteConfig.socials.linkedin, siteConfig.socials.github];

export function buildOrganizationSchema(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "IA-ZR",
    alternateName: "iazr.tech",
    url: siteConfig.url,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
    description: dict.meta.description,
    slogan: "Transformamos ideas y operaciones manuales en sistemas inteligentes que funcionan solos.",
    email: siteConfig.author.email,
    telephone: siteConfig.author.whatsappDisplay,
    founder: { "@id": PERSON_ID },
    areaServed: ["US", "Latin America"],
    sameAs: SAME_AS,
  };
}

export function buildServiceSchema(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    "@type": "ProfessionalService",
    "@id": SERVICE_ID,
    name: "IA-ZR",
    url: `${siteConfig.url}/${locale}`,
    image: LOGO_URL,
    description: dict.meta.description,
    telephone: siteConfig.author.whatsappDisplay,
    email: siteConfig.author.email,
    address: { "@type": "PostalAddress", addressCountry: "CO" },
    areaServed: ["US", "Latin America"],
    parentOrganization: { "@id": ORG_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: dict.tracks.title,
      itemListElement: dict.tracks.items.map((track) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `${track.tag}: ${track.title}`,
          description: `${track.audience} ${track.features.map((f) => f.text).join(", ")}.`,
        },
      })),
    },
  };
}

export function buildPersonSchema(locale: Locale) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Iván Andrés Zúñiga Romo",
    givenName: siteConfig.author.givenName,
    familyName: "Zúñiga Romo",
    jobTitle: locale === "es" ? "Fundador de IA-ZR" : "Founder of IA-ZR",
    url: `${siteConfig.url}/${locale}/about`,
    image: { "@type": "ImageObject", url: PORTRAIT_URL, width: 800, height: 800 },
    sameAs: [siteConfig.author.linkedin, siteConfig.author.github],
    email: siteConfig.author.email,
    worksFor: { "@id": ORG_ID },
    knowsLanguage: ["es", "en"],
    alumniOf: education
      .filter((e) => e.id !== "unir-ia")
      .map((e) => ({ "@type": "CollegeOrUniversity" as const, name: e.institution })),
    hasCredential: [
      ...education.map((e) => ({
        "@type": "EducationalOccupationalCredential" as const,
        credentialCategory: "degree",
        name: localize(e.degree, locale),
      })),
      // The 15 international certifications (lib/data/experience.ts drives the count).
      ...certifications.flatMap((group) =>
        group.credentials.map((c) => ({
          "@type": "EducationalOccupationalCredential" as const,
          credentialCategory: "certificate",
          name: c.name,
          recognizedBy: { "@type": "Organization" as const, name: c.issuer },
          ...(c.verifyUrl ? { url: c.verifyUrl } : {}),
        }))
      ),
    ],
  };
}

export function buildWebSiteSchema(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: getDictionary(locale).meta.title,
    inLanguage: LANGUAGE_TAG[locale],
    publisher: { "@id": ORG_ID },
  };
}

/** The full graph: Organization → ProfessionalService → Person → WebSite. */
export function buildJsonLdGraph(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationSchema(locale), buildServiceSchema(locale), buildPersonSchema(locale), buildWebSiteSchema(locale)],
  };
}

