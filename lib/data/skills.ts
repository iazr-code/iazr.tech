/**
 * Dominios de capacidad (stack real del CV, julio 2026).
 */
import { Bot, Cloud, Cpu, GraduationCap, ShieldCheck, Workflow, type LucideIcon } from "lucide-react";

import type { Localized } from "@/lib/i18n/localized";

export type SkillTile = {
  id: string;
  title: Localized;
  description: Localized;
  icon: LucideIcon;
  tags: string[];
  featured?: boolean;
};

export const skills: SkillTile[] = [
  {
    id: "fullstack",
    title: { es: "Desarrollo Full-Stack", en: "Full-stack development" },
    description: {
      es: "Aplicaciones y sitios de producción con React, Next.js, Supabase y Node.js: de la interfaz al backend, con arquitectura limpia y rendimiento medible.",
      en: "Production apps and sites with React, Next.js, Supabase and Node.js: from interface to backend, with clean architecture and measurable performance.",
    },
    icon: Cpu,
    tags: ["React", "Next.js", "Supabase", "Node.js", "Python", "TypeScript", "Git"],
    featured: true,
  },
  {
    id: "datos-ia",
    title: { es: "Datos & IA", en: "Data & AI" },
    description: {
      es: "Analítica con Power BI y SQL, bases PostgreSQL/MongoDB y Machine Learning aplicado a decisiones y productos.",
      en: "Analytics with Power BI and SQL, PostgreSQL/MongoDB databases and machine learning applied to decisions and products.",
    },
    icon: Bot,
    tags: ["PostgreSQL", "MongoDB", "Power BI", "SQL", "Machine Learning"],
  },
  {
    id: "infraestructura",
    title: { es: "Infraestructura & Cloud", en: "Infrastructure & cloud" },
    description: {
      es: "Despliegue y operación con Azure, Huawei Cloud y Vercel, más automatización de procesos con n8n sobre Linux.",
      en: "Deployment and operations on Azure, Huawei Cloud and Vercel, plus process automation with n8n on Linux.",
    },
    icon: Cloud,
    tags: ["Linux", "Azure", "Huawei Cloud", "Vercel", "n8n"],
  },
  {
    id: "ciberseguridad",
    title: { es: "Ciberseguridad", en: "Cybersecurity" },
    description: {
      es: "Seguridad de la información: protección de sistemas y redes, respuesta a incidentes y protocolos de integridad.",
      en: "Information security: protection of systems and networks, incident response and integrity protocols.",
    },
    icon: ShieldCheck,
    tags: ["InfoSec", "Incident response", "Networks"],
  },
  {
    id: "gestion",
    title: { es: "Gestión estratégica", en: "Strategic management" },
    description: {
      es: "Metodologías de gestión pública y empresarial: formulación de proyectos (MGA), PDM, Scrum, CRM y BPM.",
      en: "Public and business management methods: project formulation (MGA), development plans, Scrum, CRM and BPM.",
    },
    icon: Workflow,
    tags: ["MGA", "Scrum", "CRM", "BPM"],
  },
  {
    id: "mentoria",
    title: { es: "Mentoría & formación", en: "Mentoring & training" },
    description: {
      es: "Mentor de bootcamps (Talento TECH), profesor de cátedra y formador en habilidades digitales: +500 personas acompañadas.",
      en: "Bootcamp mentor (Talento TECH), university lecturer and digital-skills trainer: 500+ people mentored.",
    },
    icon: GraduationCap,
    tags: ["Talento TECH", "Bootcamps", "Hackathons"],
  },
];
