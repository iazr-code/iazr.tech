/**
 * Oferta B2B: lo que contrata una startup, una pyme o un cliente internacional.
 * Vende resultados, no tecnologías sueltas. Los `id` coinciden con
 * `serviceOptions` del formulario de contacto.
 */
import { BrainCircuit, Gauge, Network, ShieldCheck, type LucideIcon } from "lucide-react";

import type { Localized } from "@/lib/i18n/localized";

export type Service = {
  id: "fullstack" | "ia-datos" | "direccion-tecnologica" | "mentoria";
  /** Índice del objeto 3D de la escena de servicios. */
  index: number;
  title: Localized;
  description: Localized;
  outcomes: Localized<string[]>;
  tags: string[];
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    id: "fullstack",
    index: 0,
    title: {
      es: "Desarrollo web de alto rendimiento",
      en: "High-performance web development",
    },
    description: {
      es: "Sitios corporativos, plataformas y productos SaaS con React, Next.js y Supabase/Node.js: rápidos, accesibles, medibles y listos para escalar.",
      en: "Corporate sites, platforms and SaaS products built with React, Next.js and Supabase/Node.js: fast, accessible, measurable and ready to scale.",
    },
    outcomes: {
      es: ["Core Web Vitals en verde", "SEO técnico desde el día uno", "Arquitectura mantenible"],
      en: ["Green Core Web Vitals", "Technical SEO from day one", "Maintainable architecture"],
    },
    tags: ["React", "Next.js", "Supabase", "Node.js", "TypeScript"],
    icon: Gauge,
  },
  {
    id: "ia-datos",
    index: 1,
    title: {
      es: "Automatización & IA aplicada",
      en: "Automation & applied AI",
    },
    description: {
      es: "Asistentes con IA para ventas y soporte, automatización de procesos con n8n y tableros de datos (Power BI, SQL) que convierten operaciones en decisiones.",
      en: "AI assistants for sales and support, process automation with n8n and data dashboards (Power BI, SQL) that turn operations into decisions.",
    },
    outcomes: {
      es: ["Menos tareas manuales", "Atención 24/7 con IA", "Datos accionables"],
      en: ["Fewer manual tasks", "24/7 AI-assisted service", "Actionable data"],
    },
    tags: ["LLMs", "n8n", "Power BI", "SQL", "WhatsApp"],
    icon: BrainCircuit,
  },
  {
    id: "direccion-tecnologica",
    index: 2,
    title: {
      es: "Ecosistemas digitales & dirección tecnológica",
      en: "Digital ecosystems & technology leadership",
    },
    description: {
      es: "Diseño y dirección de ecosistemas completos (web, CRM, IA y datos conectados) con roadmap, arquitectura y equipo: un socio técnico para proyectos de gran envergadura.",
      en: "Design and leadership of full ecosystems (web, CRM, AI and data, connected) with roadmap, architecture and team: a technical partner for large-scale projects.",
    },
    outcomes: {
      es: ["Roadmap accionable en 1–2 semanas", "Arquitectura y riesgos claros", "Ejecución acompañada"],
      en: ["Actionable roadmap in 1–2 weeks", "Clear architecture and risks", "Hands-on execution"],
    },
    tags: ["Arquitectura", "CRM", "Cloud", "Scrum"],
    icon: Network,
  },
  {
    id: "mentoria",
    index: 3,
    title: {
      es: "Mentoría & formación de equipos",
      en: "Team mentoring & training",
    },
    description: {
      es: "Formación en programación, datos e IA para equipos y programas: mentor de bootcamps y profesor universitario con +500 personas formadas.",
      en: "Training in programming, data and AI for teams and programs: bootcamp mentor and university lecturer with 500+ people trained.",
    },
    outcomes: {
      es: ["Equipos autónomos", "Buenas prácticas de código", "Adopción de IA"],
      en: ["Autonomous teams", "Solid coding practices", "AI adoption"],
    },
    tags: ["Bootcamps", "IA", "Datos", "Talento TECH"],
    icon: ShieldCheck,
  },
];
