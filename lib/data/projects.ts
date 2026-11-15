/**
 * Casos de éxito desplegados en producción (sitios vivos verificables).
 * `image` es la captura original (respaldo HTML accesible); las texturas
 * optimizadas para los portales 3D se generan en public/textures/projects/.
 */
import type { Localized } from "@/lib/i18n/localized";

export type Project = {
  id: string;
  codename: string;
  role: Localized;
  name: string;
  description: Localized;
  stack: string[];
  href: string;
  hrefLabel: Localized;
  image: string;
  year: string;
  /** Verified results, said as sentences. */
  results?: Localized<string[]>;
  /** Verified headline figures shown as badges (only where the client confirmed them). */
  highlights?: { value: string; label: Localized }[];
  /** Industries for the case filter, read from what each deployment is. */
  industries: Industry[];
};

export type Industry = "health" | "b2b" | "education" | "ai" | "culture";
export const INDUSTRIES: Industry[] = ["health", "b2b", "education", "ai", "culture"];

const visit: Localized = { es: "Visitar sitio", en: "Visit site" };

export const featuredProjects: Project[] = [
  {
    id: "zolaris",
    industries: ["ai", "b2b"],
    codename: "zolarisweb",
    role: { es: "Asistente IA, CRM y web", en: "AI assistant, CRM and website" },
    name: "Zolaris Ingeniería",
    description: {
      es: "Asistente de IA para ventas en WhatsApp, plataforma CRM y RRHH a medida y portal web corporativo integrado con n8n.",
      en: "An AI sales assistant on WhatsApp, a custom CRM and HR platform and a corporate site wired into n8n.",
    },
    results: {
      es: [
        "Más del 80 % menos tiempo de atención inicial con el asistente de IA en WhatsApp, activo las 24 horas.",
        "El 100 % de la trazabilidad operativa centralizada en la plataforma CRM y RRHH.",
        "99,9 % de disponibilidad del portal web corporativo integrado con n8n.",
      ],
      en: [
        "Over 80% less time to first response with the AI assistant on WhatsApp, running 24/7.",
        "100% of operational traceability centralised in the CRM and HR platform.",
        "99.9% uptime for the corporate site wired into n8n.",
      ],
    },
    highlights: [
      { value: "> 80 %", label: { es: "menos tiempo de atención inicial", en: "less time to first response" } },
      { value: "100 %", label: { es: "trazabilidad en el CRM", en: "traceability in the CRM" } },
      { value: "99,9 %", label: { es: "disponibilidad del portal", en: "site uptime" } },
    ],
    stack: ["Next.js", "Supabase", "n8n", "WhatsApp API", "IA"],
    href: "https://zolarisweb.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/Zolaris.png",
    year: "2026",
  },
  {
    id: "la-campana",
    industries: ["b2b"],
    codename: "lacampana.co",
    role: { es: "Web corporativa", en: "Corporate website" },
    name: "La Campana",
    description: {
      es: "Presencia web B2B con identidad de marca y estructura orientada a conversión, posicionamiento SEO local y contacto rápido con tarjetas y stands NFC y QR.",
      en: "B2B web presence with brand identity and a conversion-led structure, local SEO and quick contact through NFC and QR cards and stands.",
    },
    stack: ["Next.js", "Tailwind CSS", "SEO"],
    href: "https://lacampana.co/",
    hrefLabel: visit,
    image: "/proyectos/LaCampana.png",
    year: "2025",
  },
  {
    id: "emssanar-eps",
    industries: ["health"],
    codename: "emssanareps.co",
    role: { es: "Portal institucional", en: "Institutional portal" },
    name: "Emssanar EPS",
    description: {
      es: "Portal institucional para una EPS del sistema de salud colombiano: información de afiliados, servicios y canales de atención con arquitectura accesible y escalable.",
      en: "Institutional portal for a Colombian health insurer: member information, services and support channels on an accessible, scalable architecture.",
    },
    stack: ["Next.js", "React", "Accesibilidad", "CMS"],
    href: "https://emssanareps.co/",
    hrefLabel: visit,
    image: "/proyectos/EmssanarEPS.png",
    year: "2025",
  },
  {
    id: "paisajes-sonoros",
    industries: ["culture"],
    codename: "paisajes-sonoros",
    role: { es: "Experiencia cultural", en: "Cultural experience" },
    name: "Paisajes Sonoros",
    description: {
      es: "Plataforma experiencial de paisajes sonoros: audio inmersivo, curaduría editorial y diseño visual cinematográfico para un proyecto cultural.",
      en: "Experiential soundscape platform: immersive audio, editorial curation and cinematic visual design for a cultural project.",
    },
    stack: ["Next.js", "Framer Motion", "Audio"],
    href: "https://paisajes-sonoros.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/PaisajesSonoros.png",
    year: "2025",
  },
  {
    id: "dozurcol-pasto",
    industries: ["b2b"],
    codename: "dozurcol-pasto",
    role: { es: "Sitio comercial", en: "Commercial site" },
    name: "Dozurcol Pasto",
    description: {
      es: "Sitio comercial para la sede Pasto de Dozurcol: catálogo B2B, posicionamiento SEO local y contacto rápido con tarjetas y stands NFC y QR.",
      en: "Commercial site for Dozurcol's Pasto branch: a B2B catalogue, local SEO and quick contact through NFC and QR cards and stands.",
    },
    stack: ["Next.js", "Tailwind CSS", "SEO local"],
    href: "https://dozurcol-pasto.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/DozurcolPasto.png",
    year: "2025",
  },
  {
    id: "portafolio-sandra",
    industries: ["health"],
    codename: "portafolio-sandra-sst",
    role: { es: "Portafolio profesional", en: "Professional portfolio" },
    name: "Portafolio Sandra Gómez",
    description: {
      es: "Portafolio profesional de Seguridad y Salud en el Trabajo: hoja de vida interactiva, servicios y casos de éxito para posicionar una consultoría personal.",
      en: "Occupational health & safety professional portfolio: interactive résumé, services and case studies to position a personal consultancy.",
    },
    stack: ["Next.js", "Framer Motion", "Web Vitals"],
    href: "https://portafolio-sandra-sst.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/PortafolioSandraGomez.png",
    year: "2025",
  },
  {
    id: "panini-2026",
    industries: ["culture"],
    codename: "panini26",
    role: { es: "Experiencia de colección", en: "Collector experience" },
    name: "Panini 2026",
    description: {
      es: "Experiencia web de colección para el álbum Panini 2026: intercambio de cromos, listas de colección y comunidad, con interacción fluida.",
      en: "Collector web experience for the Panini 2026 album: sticker trading, collection lists and community, with fluid interaction.",
    },
    stack: ["Next.js", "React 19", "Estado global"],
    href: "https://panini26.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/Panini2026.png",
    year: "2026",
  },
  {
    id: "metodo-sonora",
    industries: ["education"],
    codename: "metodo-sonora",
    role: { es: "Plataforma educativa", en: "Learning platform" },
    name: "Método Sonora",
    description: {
      es: "Plataforma educativa del Método Sonora: contenidos de formación musical, progreso del estudiante y diseño editorial de alto impacto.",
      en: "Learning platform for Método Sonora: music training content, student progress and high-impact editorial design.",
    },
    stack: ["Next.js", "Tailwind CSS", "Audio"],
    href: "https://metodo-sonora.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/MetodoSonora.png",
    year: "2025",
  },
  {
    id: "sst-medsys",
    industries: ["health"],
    codename: "sst-med-sys",
    role: { es: "Dashboard de salud", en: "Health dashboard" },
    name: "SST MedSys",
    description: {
      es: "Dashboard de gestión de seguridad y salud en el trabajo: métricas, reportes clínicos y control de indicadores en una interfaz de datos densa.",
      en: "Occupational health management dashboard: metrics, clinical reports and KPI tracking in a dense data interface.",
    },
    stack: ["Next.js", "React", "Dashboard", "Datos"],
    href: "https://sst-med-sys.vercel.app/dashboard",
    hrefLabel: { es: "Ver dashboard", en: "View dashboard" },
    image: "/proyectos/SSTMedSys.png",
    year: "2025",
  },
];

export const githubProfileUrl = "https://github.com/andreszuniga96";
