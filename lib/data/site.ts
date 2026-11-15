/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN CENTRAL DEL SITIO IAZR
 *  Fuente única de verdad para nombre, URL y contactos. Layout, SEO (JSON-LD),
 *  Open Graph y componentes la importan: cambiar un dato aquí lo propaga a todo
 *  el ecosistema, evitando cadenas mágicas duplicadas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const siteConfig = {
  /** Marca visible y apéndice del patrón title.template de SEO */
  name: "IA-ZR",
  /** Título por defecto de la landing (sin plantilla aplicada) */
  title: "IA-ZR | Ingeniería, IA & Automatización Empresarial",
  description:
    "IA-ZR (IAZR tech) diseña e implementa agentes de IA en WhatsApp, agendamiento, CRM, automatización con n8n e integraciones con ERP para negocios y empresas en EE. UU. y LATAM.",
  /** metadataBase: todas las URLs relativas de SEO/OG se resuelven contra este origen */
  // 1) NEXT_PUBLIC_SITE_URL if set; 2) Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL:
  //    iazr-tech.vercel.app today, iazr.tech by itself once that domain is attached); 3) the official domain.
  // Share images and canonical URLs must resolve, so never point at a domain that does not answer yet.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "https://iazr.tech"
  ).replace(/\/$/, ""),
  locale: "es_CO",
  // Cast explícito: `as const` (del objeto contenedor) haría el tuple readonly
  // e incompatible con el tipo string[] que exige la API de Metadatos de Next.
  keywords: [
    "IAZR",
    "IAZR tech",
    "IA-ZR",
    "iazr.tech",
    "IA-ZR tech",
    "agencia de inteligencia artificial",
    "automatización de procesos",
    "agente de IA en WhatsApp",
    "chatbot WhatsApp para negocios",
    "automatización con n8n",
    "integración SAP",
    "integración Siigo Nube",
    "tableros Power BI",
    "CRM a medida",
    "tarjetas NFC para negocios",
    "reseñas Google con QR",
    "desarrollo web Next.js",
    "AI automation agency",
    "WhatsApp AI agent",
    "Iván Andrés Zúñiga Romo",
    "Colombia",
    "LATAM",
    "Estados Unidos",
  ] as string[],
  /** Ubicación y horario del ingeniero (footer, contacto, about, JSON-LD). */
  location: "Colombia · Remoto global",
  timezone: "GMT-5 (UTC-5)",
  /** Abreviatura corta de franja (p. ej. badges y footer). */
  timezoneShort: "GMT-5",
  author: {
    name: "Iván Andrés Zúñiga",
    givenName: "Iván Andrés",
    familyName: "Zúñiga",
    /** Perfil público principal (proporcionado por el usuario). AnZuCa y los
        demás identificadores del informe quedan como alias secundarios. */
    github: "https://github.com/andreszuniga96",
    githubAlt: [
      "https://github.com/AnZuCa",
      "https://github.com/andres-zuniga",
      "https://github.com/Xgamer1999",
    ],
    /** Datos reales de contacto (CV julio 2026). */
    linkedin: "https://www.linkedin.com/in/iazr96/",
    email: "iazr.code@gmail.com",
    /** WhatsApp: número con código de país (sin +, espacios ni guiones). */
    whatsapp: "https://wa.me/573229132643",
    whatsappDisplay: "+57 322 913 2643",
  },
  socials: {
    github: "https://github.com/andreszuniga96",
    linkedin: "https://www.linkedin.com/in/iazr96/",
    instagram: "https://www.instagram.com/iazr.tech/",
    email: "mailto:iazr.code@gmail.com",
    whatsapp: "https://wa.me/573229132643",
  },
  /** Navegación principal: anclas de la landing + ruta /about (página propia) */
  nav: [
    { label: "Inicio", href: "#inicio" },
    { label: "Acerca de", href: "/about" },
    { label: "Capacidades", href: "#capacidades" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Conversación", href: "#conversacion" },
    { label: "Contacto", href: "#contacto" },
  ],
} as const;
