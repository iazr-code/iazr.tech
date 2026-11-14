import { z } from "zod";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  VALIDACIÓN DE CONTACTO — Zod (esquema de datos del lado del servidor).
 *  La fuente de verdad es el SERVIDOR: la Server Action valida con este esquema
 *  antes de cualquier procesamiento (envío de correo / registro en CRM).
 *  Los mensajes son específicos y en español (UX B2B).
 *
 *  Seguridad:
 *  · `website` es un honeypot oculto: si un bot lo rellena, max(0) falla y la
 *    acción se rechaza sin procesar nada.
 *  · Longitudes acotadas (name/company/message) → sin abuso de payload.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const serviceOptions = [
  "direccion-tecnologica",
  "fullstack",
  "ia-datos",
  "mentoria",
  "otro",
] as const;

export const serviceLabels: Record<(typeof serviceOptions)[number], string> = {
  "direccion-tecnologica": "Vía 01 · Ecosistema IA-ZR Control",
  fullstack: "Vía 02 · Plataforma web o SaaS",
  "ia-datos": "Vía 02 · Automatización e integraciones",
  mentoria: "Formación de equipos",
  otro: "Aún no lo sé",
};

export const budgetOptions = [
  "<5k",
  "5k-15k",
  "15k-50k",
  "50k+",
  "indefinido",
] as const;

export const budgetLabels: Record<(typeof budgetOptions)[number], string> = {
  "<5k": "Menos de USD 5k",
  "5k-15k": "USD 5k – 15k",
  "15k-50k": "USD 15k – 50k",
  "50k+": "Más de USD 50k",
  indefinido: "Aún sin definir",
};

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name_min")
    .max(80, "name_max"),
  email: z.email("email_invalid"),
  company: z.string().trim().max(120, "company_max").optional(),
  service: z.enum(serviceOptions, {
    error: "service_required",
  }),
  budget: z.enum(budgetOptions).optional(),
  message: z
    .string()
    .trim()
    .min(20, "message_min")
    .max(2000, "message_max"),
  /** Honeypot anti-bots: si aparece contenido, la validación falla. */
  website: z.string().max(0, "honeypot").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
