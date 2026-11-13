import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import { certifications, education, experience } from "@/lib/data/experience";

const LANGUAGE_TAG: Record<Locale, string> = { es: "es-CO", en: "en-US" };

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  JSON-LD — Datos Estructurados Schema.org
 *  Se renderizan en el SERVIDOR dentro de app/layout.tsx (Server Component),
 *  fusionados con el HTML crudo de la primera pasada. Esto garantiza que las
 *  arañas de Googlebot accedan a la topología semántica sin ejecutar JavaScript.
 *
 *  Topología doble exigida por la especificación:
 *   · @type: "Person"      → identidad individual de Iván Andrés Zúñiga
 *   · @type: "Organization"→ entidad consultora B2B (dirección tecnológica)
 *
 *  El objeto devuelto se serializa con JSON.stringify (saneado contra XSS por
 *  Next al escaparlo) en el componente <JsonLd>.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Person = {
  "@type": "Person";
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  url: string;
  image: string;
  sameAs: string[];
  email: string;
  telephone: string;
  knowsAbout: string[];
  alumniOf: { "@type": "CollegeOrUniversity"; name: string }[];
  hasCredential: { "@type": "EducationalOccupationalCredential"; name: string }[];
  worksFor: { "@type": "Organization"; name: string }[];
  knowsLanguage: string;
  address: { "@type": "PostalAddress"; addressCountry: string; addressLocality: string };
};

type Organization = {
  "@type": "Organization";
  name: string;
  alternateName: string;
  url: string;
  logo: string;
  description: string;
  slogan: string;
  email: string;
  founder: { "@type": "Person"; name: string; url: string };
  areaServed: string;
  numberOfEmployees: { "@type": "QuantitativeValue"; value: number };
  makesOffer: { "@type": "Offer"; itemOffered: { "@type": "Service"; name: string; description: string } }[];
};

export function buildPersonSchema(): Person {
  return {
    "@type": "Person",
    name: siteConfig.author.name,
    givenName: siteConfig.author.givenName,
    familyName: siteConfig.author.familyName,
    jobTitle: "Director Tecnológico · Full-Stack Developer · Mentor Tech",
    url: siteConfig.url,
    /**
     * image: la foto del perfil professional expuesta como og.png.
     * Google usa este campo para poblar el Knowledge Panel cuando
     * el autor aparece en búsquedas de nombre propio.
     */
    image: `${siteConfig.url}/og.png`,
    sameAs: [
      siteConfig.author.github,
      ...siteConfig.author.githubAlt,
      siteConfig.author.linkedin,
    ],
    email: siteConfig.author.email,
    telephone: siteConfig.author.whatsappDisplay,
    knowsAbout: [
      "Desarrollo Full-Stack",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "Bases de datos",
      "PostgreSQL",
      "MongoDB",
      "Analítica de datos",
      "Power BI",
      "SQL",
      "Machine Learning",
      "Inteligencia Artificial",
      "Cloud",
      "Azure",
      "Huawei Cloud",
      "Ciberseguridad",
      "Transformación digital",
      "Gestión de proyectos",
    ],
    alumniOf: education
      .filter((e) => e.id !== "unir-ia") // UNIR está en curso; el resto son títulos completados
      .map((e) => ({ "@type": "CollegeOrUniversity" as const, name: e.institution })),
    hasCredential: [
      ...education.map((e) => ({
        "@type": "EducationalOccupationalCredential" as const,
        name: e.degree,
      })),
      ...certifications.flatMap((group) =>
        group.credentials.map((name) => ({
          "@type": "EducationalOccupationalCredential" as const,
          name,
        }))
      ),
    ],
    worksFor: experience.map((e) => ({ "@type": "Organization" as const, name: e.org })),
    knowsLanguage: "es, en",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CO",
      addressLocality: "Colombia",
    },
  };
}

export function buildOrganizationSchema(): Organization {
  return {
    "@type": "Organization",
    name: "IAZR — Dirección Tecnológica & Full-Stack",
    alternateName: "IAZR · IA, Full-Stack & Formación",
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    slogan: "Director Tecnológico · Full-Stack Developer · Mentor Tech",
    email: siteConfig.author.email,
    founder: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.url },
    areaServed: "Global (Colombia · Remoto)",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Dirección Tecnológica & Transformación Digital",
          description:
            "Dirección de innovación digital, asistentes virtuales con IA, plataformas CRM y web corporativa.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Desarrollo Full-Stack",
          description: "Sitios web corporativos y plataformas con React, Next.js y Node.js.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "IA aplicada & Datos",
          description: "Analítica con Power BI y SQL, bases de datos e integración de IA en producto.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Mentoría & Formación Tech",
          description: "Bootcamps y formación en habilidades digitales, programación y análisis de datos.",
        },
      },
    ],
  };
}

/**
 * ProfilePage schema (Schema.org 2024).
 * Señal directa para páginas de portafolio personal: Google las identifica
 * como "About Me" / "Profile" y las posiciona con mayor confianza en
 * búsquedas de nombre de persona + cargo.
 */
export function buildProfilePageSchema(locale: Locale) {
  const person = buildPersonSchema();
  const url = `${siteConfig.url}/${locale}`;
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    inLanguage: LANGUAGE_TAG[locale],
    name: `${siteConfig.author.name} — Portafolio Profesional`,
    description: siteConfig.description,
    dateCreated: "2026-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntity: person,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "es" ? "Inicio" : "Home",
          item: url,
        },
      ],
    },
  };
}

/**
 * WebSite schema. Sin SearchAction: el sitio no tiene buscador y declarar uno
 * inexistente es un dato estructurado falso.
 */
export function buildWebSiteSchema(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.title,
    description: siteConfig.description,
    inLanguage: LANGUAGE_TAG[locale],
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  };
}

/** Grafo completo: ProfilePage → Person → Organization → WebSite. */
export function buildJsonLdGraph(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildProfilePageSchema(locale),
      buildPersonSchema(),
      buildOrganizationSchema(),
      buildWebSiteSchema(locale),
    ],
  };
}
