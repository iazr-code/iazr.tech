/**
 * Trayectoria verificable (CV de Iván Andrés Zúñiga, julio 2026).
 * Fuente única de la línea de tiempo, la escena 3D de trayectoria y el JSON-LD.
 * Los nombres propios de instituciones y organizaciones no se traducen.
 */
import type { Localized } from "@/lib/i18n/localized";

export type EducationEntry = {
  id: string;
  institution: string;
  degree: Localized;
  period: Localized;
  description: Localized;
};

export type ExperienceEntry = {
  id: string;
  role: Localized;
  org: string;
  period: Localized;
  description: Localized;
  highlights: Localized<string[]>;
};

export type CertificationGroup = {
  id: string;
  vendor: string;
  description: Localized;
  credentials: string[];
};

export const education: EducationEntry[] = [
  {
    id: "unir-ia",
    institution: "Fundación Universitaria Internacional de La Rioja (UNIR)",
    degree: { es: "Especialización en Inteligencia Artificial", en: "Specialization in Artificial Intelligence" },
    period: { es: "En curso", en: "In progress" },
    description: {
      es: "Formación avanzada en IA: modelos, agentes y aplicaciones de inteligencia artificial aplicadas a producto y transformación digital.",
      en: "Advanced AI training: models, agents and artificial-intelligence applications for products and digital transformation.",
    },
  },
  {
    id: "magister-administracion",
    institution: "Universidad Mariana — Sede Pasto",
    degree: { es: "Magíster en Administración", en: "Master's in Business Administration" },
    period: { es: "2021 – 2023", en: "2021 – 2023" },
    description: {
      es: "Máster con Mención de Honor: gestión estratégica, toma de decisiones y administración de alto nivel para liderar proyectos tecnológicos y de negocio.",
      en: "Master's with Honors: strategic management, decision-making and senior administration to lead technology and business projects.",
    },
  },
  {
    id: "alta-gerencia",
    institution: "Universidad Mariana — Sede Pasto",
    degree: { es: "Especialista en Alta Gerencia", en: "Specialist in Senior Management" },
    period: { es: "2018 – 2019", en: "2018 – 2019" },
    description: {
      es: "Especialización con certificado de Alto Rendimiento: dirección de organizaciones, liderazgo y gestión de equipos de alto desempeño.",
      en: "Specialization with a High Performance certificate: organizational leadership and management of high-performing teams.",
    },
  },
  {
    id: "ing-sistemas",
    institution: "Universidad Sergio Arboleda — Sede Bogotá",
    degree: { es: "Ingeniero de Sistemas y Telecomunicaciones", en: "B.Eng. in Systems and Telecommunications" },
    period: { es: "2012 – 2017", en: "2012 – 2017" },
    description: {
      es: "Base académica en ingeniería de sistemas: programación, redes, telecomunicaciones y arquitectura de software.",
      en: "Academic foundation in systems engineering: programming, networks, telecommunications and software architecture.",
    },
  },
];

/** 11 certificaciones internacionales, agrupadas por emisor. */
export const certifications: CertificationGroup[] = [
  {
    id: "microsoft",
    vendor: "Microsoft",
    description: {
      es: "Credenciales de analítica de datos, desarrollo web y fundamentos de nube.",
      en: "Credentials in data analytics, web development and cloud fundamentals.",
    },
    credentials: ["Power BI Data Analyst", "Front-End Developer", "Azure Fundamentals"],
  },
  {
    id: "huawei",
    vendor: "Huawei",
    description: {
      es: "Certificaciones oficiales HCIA en inteligencia artificial, nube, IoT y 5G.",
      en: "Official HCIA certifications in artificial intelligence, cloud, IoT and 5G.",
    },
    credentials: ["HCIA — Artificial Intelligence V3.5", "HCIA — Cloud Service", "HCIA — IoT V3.0", "HCIA — 5G V2.0"],
  },
  {
    id: "google",
    vendor: "Google",
    description: {
      es: "Certificados profesionales de Google en ciberseguridad, soporte, datos y marketing digital.",
      en: "Google professional certificates in cybersecurity, IT support, data and digital marketing.",
    },
    credentials: ["Cybersecurity Professional", "IT Support Professional", "Data Analytics", "Digital Marketing & E-commerce"],
  },
];

export const experience: ExperienceEntry[] = [
  {
    id: "zolaris",
    role: { es: "Director Tecnológico e Innovación Digital", en: "Chief Technology & Digital Innovation Officer" },
    org: "ZOLARIS INGENIERÍA",
    period: { es: "Ene – Jun 2026", en: "Jan – Jun 2026" },
    description: {
      es: "Liderazgo en transformación digital: asistente virtual con IA para ventas (WhatsApp), sitio web corporativo Full-Stack y plataforma web tipo CRM para gestión de recursos humanos.",
      en: "Digital transformation leadership: an AI sales assistant (WhatsApp), a full-stack corporate website and a CRM-style web platform for HR management.",
    },
    highlights: {
      es: ["Asistente virtual con IA para ventas (WhatsApp)", "Sitio web corporativo Full-Stack", "Plataforma web tipo CRM para gestión de RRHH"],
      en: ["AI sales assistant (WhatsApp)", "Full-stack corporate website", "CRM-style platform for HR management"],
    },
  },
  {
    id: "mentor-talentotech-3",
    role: { es: "Mentor de Bootcamps — Talento TECH (Región 3)", en: "Bootcamp Mentor — Talento TECH (Region 3)" },
    org: "Universidad Tecnológica de Pereira",
    period: { es: "Feb – Abr 2026", en: "Feb – Apr 2026" },
    description: {
      es: "Acompañamiento presencial y simulación práctica en habilidades digitales. Mentoría en hackathones, nivelaciones académicas y enseñanza de IA.",
      en: "In-person support and hands-on simulation in digital skills. Mentoring for hackathons, academic leveling and AI teaching.",
    },
    highlights: {
      es: ["Mentoría en hackathones y nivelaciones académicas", "Enseñanza de Inteligencia Artificial"],
      en: ["Hackathon and academic-leveling mentoring", "Artificial intelligence teaching"],
    },
  },
  {
    id: "mentor-iu-training",
    role: { es: "Mentor Talento Tech 2.0", en: "Talento Tech 2.0 Mentor" },
    org: "IU TRAINING",
    period: { es: "Mar – Oct 2025", en: "Mar – Oct 2025" },
    description: {
      es: "Formación en habilidades digitales: resolución de dudas, revisión de código en proyectos finales y preparación de perfiles para el mercado laboral.",
      en: "Digital-skills training: answering questions, code review of final projects and preparing profiles for the job market.",
    },
    highlights: {
      es: ["Revisión de código en proyectos finales", "Preparación de perfiles para el mercado laboral"],
      en: ["Code review of final projects", "Job-market profile preparation"],
    },
  },
  {
    id: "profesor-udea",
    role: { es: "Profesor de Cátedra (Extensión)", en: "Adjunct Lecturer (Extension)" },
    org: "Universidad de Antioquia",
    period: { es: "2025", en: "2025" },
    description: {
      es: "Docente titular en bootcamps de Análisis de Datos y Programación: diseño de talleres y lógica computacional en grupos masivos.",
      en: "Lead instructor for Data Analysis and Programming bootcamps: workshop design and computational thinking for large cohorts.",
    },
    highlights: {
      es: ["Bootcamps de Análisis de Datos y Programación", "Diseño de talleres para grupos masivos"],
      en: ["Data Analysis and Programming bootcamps", "Workshop design for large cohorts"],
    },
  },
  {
    id: "mentor-talentotech-2",
    role: { es: "Mentor Bootcamps — Talento TECH (Región 2)", en: "Bootcamp Mentor — Talento TECH (Region 2)" },
    org: "Universidad de Antioquia",
    period: { es: "Jun – Dic 2024", en: "Jun – Dec 2024" },
    description: {
      es: "Clases sincrónicas de 8+ horas semanales, gestión de contenidos, evaluación de talleres y proyectos, y formación personalizada.",
      en: "8+ hours of live classes per week, content management, workshop and project assessment, and personalized training.",
    },
    highlights: {
      es: ["Clases sincrónicas de 8+ horas semanales", "Evaluación de talleres y proyectos", "Formación personalizada"],
      en: ["8+ hours of live classes per week", "Workshop and project assessment", "Personalized training"],
    },
  },
  {
    id: "mentor-talentotech-1",
    role: { es: "Mentor Bootcamps — Talento TECH (Región 1)", en: "Bootcamp Mentor — Talento TECH (Region 1)" },
    org: "Cymetria Group S.A.S.",
    period: { es: "Oct – Dic 2024", en: "Oct – Dec 2024" },
    description: {
      es: "Formación sincrónica en habilidades digitales, promoción de propuestas innovadoras y acompañamiento personalizado a beneficiarios.",
      en: "Live digital-skills training, fostering innovative proposals and personalized support for participants.",
    },
    highlights: {
      es: ["Formación sincrónica en habilidades digitales", "Promoción de propuestas innovadoras"],
      en: ["Live digital-skills training", "Fostering innovative proposals"],
    },
  },
  {
    id: "monitor-talentotech-3",
    role: { es: "Monitor Bootcamps — Talento TECH (Región 3)", en: "Bootcamp Monitor — Talento TECH (Region 3)" },
    org: "Universidad Tecnológica de Pereira — UTP",
    period: { es: "Jun – Sep 2024", en: "Jun – Sep 2024" },
    description: {
      es: "Gestión del proceso educativo, formación en conceptos financieros, dinamización de hackathones y ferias de empleo.",
      en: "Managing the learning process, financial-concepts training, and running hackathons and job fairs.",
    },
    highlights: {
      es: ["Dinamización de hackathones y ferias de empleo", "Gestión del proceso educativo"],
      en: ["Running hackathons and job fairs", "Learning-process management"],
    },
  },
  {
    id: "asesor-mga",
    role: { es: "Asesor de Metodología General Ajustada (MGA)", en: "Public Project Methodology (MGA) Advisor" },
    org: "Alcaldía Municipal de Guachucal",
    period: { es: "Mar – May 2024", en: "Mar – May 2024" },
    description: {
      es: "Fortalecimiento de capacidades locales, sesiones prácticas de formulación de proyectos, apoyo al personal municipal y evaluación de resultados.",
      en: "Local capacity building, hands-on project-formulation sessions, support for municipal staff and results evaluation.",
    },
    highlights: {
      es: ["Formulación de proyectos con metodología MGA", "Evaluación de resultados"],
      en: ["Project formulation with the MGA methodology", "Results evaluation"],
    },
  },
  {
    id: "asesor-adel",
    role: { es: "Asesor Plan de Desarrollo del Municipio de Pasto", en: "Development Plan Advisor — Municipality of Pasto" },
    org: "Agencia de Desarrollo Local — ADEL",
    period: { es: "Feb – Jul 2024", en: "Feb – Jul 2024" },
    description: {
      es: "Coordinación y asesoría en la formulación del plan de desarrollo: control de procesos, manejo de información, facilitación técnica e informes mensuales.",
      en: "Coordination and advisory for the municipal development plan: process control, information management, technical facilitation and monthly reports.",
    },
    highlights: {
      es: ["Formulación de plan de desarrollo municipal", "Facilitación técnica y reportes mensuales"],
      en: ["Municipal development plan formulation", "Technical facilitation and monthly reports"],
    },
  },
  {
    id: "preconteo",
    role: { es: "Director Técnico Proceso Electoral PRECONTEO", en: "Technical Director — Electoral Pre-count" },
    org: "Thomas Processing & System",
    period: { es: "Ago – Nov 2023", en: "Aug – Nov 2023" },
    description: {
      es: "Dirección de infraestructura tecnológica, protocolos de seguridad y equipos de trabajo para garantizar la integridad del preconteo electoral en Nariño.",
      en: "Led technology infrastructure, security protocols and field teams to guarantee the integrity of the electoral pre-count in Nariño, Colombia.",
    },
    highlights: {
      es: ["Supervisión de infraestructura tecnológica electoral", "Protocolos de seguridad e integridad"],
      en: ["Electoral technology infrastructure oversight", "Security and integrity protocols"],
    },
  },
  {
    id: "parquesoft",
    role: { es: "Ingeniero Facilitador CTeI", en: "Science, Technology & Innovation Facilitator" },
    org: "Parquesoft Pacífico",
    period: { es: "Dic 2022 – Mar 2023", en: "Dec 2022 – Mar 2023" },
    description: {
      es: "Promoción de Ciencia, Tecnología e Innovación: talleres y asesoría técnica estratégica para el fortalecimiento comunitario y el desarrollo local.",
      en: "Promoting science, technology and innovation: workshops and strategic technical advice for community strengthening and local development.",
    },
    highlights: {
      es: ["Talleres de CTeI para fortalecimiento comunitario", "Asesoría técnica estratégica"],
      en: ["STI workshops for community strengthening", "Strategic technical advisory"],
    },
  },
  {
    id: "dozurcol",
    role: { es: "Analista de Seguridad de la Información", en: "Information Security Analyst" },
    org: "Dozurcol Pasto",
    period: { es: "Ago 2019 – Dic 2022", en: "Aug 2019 – Dec 2022" },
    description: {
      es: "Supervisión de registros de seguridad, identificación de amenazas, coordinación de respuesta a incidentes y protección continua de sistemas y redes.",
      en: "Security log monitoring, threat identification, incident-response coordination and continuous protection of systems and networks.",
    },
    highlights: {
      es: ["Gestión de incidentes y protección de sistemas y redes", "Implementación de soluciones de seguridad"],
      en: ["Incident management and protection of systems and networks", "Security solution rollout"],
    },
  },
  {
    id: "docente-itseinar",
    role: { es: "Docente Hora Cátedra", en: "Adjunct Instructor" },
    org: "Instituto Técnico Sistematizado de Nariño",
    period: { es: "Ene 2021 – Dic 2022", en: "Jan 2021 – Dec 2022" },
    description: {
      es: "Diseño y actualización de contenidos académicos, clases, evaluación de estudiantes y coordinación académica.",
      en: "Design and updating of course content, teaching, student assessment and academic coordination.",
    },
    highlights: {
      es: ["Diseño de contenidos académicos y clases", "Evaluación de estudiantes"],
      en: ["Course content design and teaching", "Student assessment"],
    },
  },
];
