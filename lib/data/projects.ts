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
};

const visit: Localized = { es: "Visitar sitio", en: "Visit site" };

export const featuredProjects: Project[] = [
  {
    id: "la-campana",
    codename: "lacampana.co",
    role: { es: "Web corporativa", en: "Corporate website" },
    name: "La Campana",
    description: {
      es: "Presencia digital corporativa: identidad de marca, contenidos institucionales y estructura orientada a conversión, con rendimiento optimizado y accesibilidad auditada.",
      en: "Corporate digital presence: brand identity, institutional content and a conversion-oriented structure, with optimized performance and audited accessibility.",
    },
    stack: ["Next.js", "Tailwind CSS", "SEO"],
    href: "https://lacampana.co/",
    hrefLabel: visit,
    image: "/proyectos/LaCampana.png",
    year: "2025",
  },
  {
    id: "emssanar-eps",
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
    codename: "dozurcol-pasto",
    role: { es: "Sitio comercial", en: "Commercial site" },
    name: "Dozurcol Pasto",
    description: {
      es: "Sitio comercial para la sede Pasto de Dozurcol: catálogo de productos, contacto y generación de confianza para venta B2B regional.",
      en: "Commercial site for Dozurcol's Pasto branch: product catalog, contact and trust-building for regional B2B sales.",
    },
    stack: ["Next.js", "Tailwind CSS", "SEO local"],
    href: "https://dozurcol-pasto.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/DozurcolPasto.png",
    year: "2025",
  },
  {
    id: "portafolio-sandra",
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
    id: "zolaris",
    codename: "zolarisweb",
    role: { es: "Web de empresa tech", en: "Tech company website" },
    name: "Zolaris",
    description: {
      es: "Sitio web para una empresa de ingeniería y tecnología: servicios, casos de éxito y equipo, con arquitectura SEO y alto rendimiento.",
      en: "Website for an engineering and technology company: services, case studies and team, with an SEO-first architecture and high performance.",
    },
    stack: ["Next.js", "SEO", "Analítica"],
    href: "https://zolarisweb.vercel.app/",
    hrefLabel: visit,
    image: "/proyectos/Zolaris.png",
    year: "2025",
  },
  {
    id: "sst-medsys",
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
