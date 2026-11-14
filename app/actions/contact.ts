"use server";

import { headers } from "next/headers";

import { contactSchema, serviceLabels } from "@/lib/validations/contact";
import type { ContactState } from "@/lib/contact-state";
import { siteConfig } from "@/lib/data/site";
import { trackLead } from "@/lib/analytics/lead";
import { contactAttemptLimiter, contactLimiter, getClientIp } from "@/lib/security/rate-limit";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SERVER ACTION — submitContact (React 19, 'use server').
 *
 *  Mutación sin API REST intermedia (superficie de ataque mínima):
 *  1. Validación estricta del esquema con Zod (fuente de verdad en servidor).
 *  2. Rate limit por IP (3 / 10 min) + guardia honeypot.
 *  3. Entrega del lead:
 *     · Con `RESEND_API_KEY` → correo transaccional vía Resend (fetch directo)
 *       hacia el email de IAZR (siteConfig.author.email), con reply_to al
 *       interesado para responderle con un clic.
 *     · Sin clave → "modo demo": respuesta de éxito sin envío (coherente con el
 *       chat del sitio, que también tiene modo demo). El estado devuelto es el
 *       mismo en ambos casos → la UI no conoce la diferencia.
 *  4. Autorespuesta de confirmación al interesado (best-effort): el lead es lo
 *     crítico y jamás se bloquea por un fallo de la confirmación. Con el
 *     remitente por defecto (onboarding@resend.dev) Resend solo entrega al
 *     correo registrado de la cuenta; con un dominio verificado (RESEND_FROM)
 *     la confirmación funciona para cualquier visitante.
 *  5. Telemetría de conversión (best-effort): cada lead válido se registra en
 *     PostHog (evento `lead_submitted` — fecha, servicio, presupuesto) sin
 *     PII; un fallo aquí jamás afecta la entrega ni la respuesta al visitante.
 *
 *  Retorna un objeto serializable (requisito de useActionState): jamás se
 *  exponen internals ni credenciales al cliente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Autorespuesta en el idioma del visitante. */
function autoReply(locale: Locale, name: string, service: string) {
  const { email, whatsappDisplay, name: author } = siteConfig.author;
  const lines =
    locale === "es"
      ? [
          `Hola ${name}:`,
          "",
          `Recibimos tu solicitud (${service}). Gracias por tu interés en trabajar con IA-ZR.`,
          "",
          "La revisamos y te respondemos con un plan concreto en menos de 24 horas hábiles (GMT-5).",
          "",
          `Si es urgente, escríbenos a ${email} o por WhatsApp al ${whatsappDisplay}.`,
          "",
          "Saludos,",
          `${author} — IA-ZR`,
        ]
      : [
          `Hi ${name},`,
          "",
          `We received your request (${service}). Thanks for your interest in working with IA-ZR.`,
          "",
          "We will review it and reply with a concrete plan within 24 business hours (GMT-5).",
          "",
          `If it is urgent, email us at ${email} or message us on WhatsApp at ${whatsappDisplay}.`,
          "",
          "Best regards,",
          `${author} — IA-ZR`,
        ];
  return {
    subject: locale === "es" ? "Solicitud recibida — IA-ZR" : "Request received — IA-ZR",
    text: lines.join("\n"),
  };
}

/** Remitente por defecto: solo puede enviar al correo registrado en la cuenta. */
const DEFAULT_FROM = "IAZR Portfolio <onboarding@resend.dev>";

/**
 * Envío transaccional vía API de Resend (sin dependencias externas).
 * Lanza si Resend no acepta el correo (estatus ≠ 2xx).
 */
async function sendEmail({
  from,
  to,
  replyTo,
  subject,
  text,
}: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    // Timeout acotado: si Resend está caído, el formulario responde en segundos
    // en lugar de colgarse en el connect timeout por defecto de Node (10s × 2
    // correos = 20s+ de espera para el visitante).
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      from,
      to: [to],
      // reply_to solo si existe: evita campos vacíos en la petición.
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}`);
  }
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Los campos opcionales vacíos (selects sin selección) se normalizan a
  // `undefined` para que Zod los trate como ausentes, no como cadenas inválidas.
  // Dos límites por IP (sustituyen al antiguo bloqueo global en memoria):
  // · intentos brutos (20 / 10 min) contra el spam, antes de validar;
  // · envíos válidos (3 / 10 min), DESPUÉS de validar: un error de tipeo no
  //   le cuesta al visitante uno de sus envíos.
  const ip = getClientIp(await headers());
  if (!contactAttemptLimiter.check(ip).ok) {
    return { status: "error", message: "rate_limited", fieldErrors: null };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? "") || undefined,
    service: String(formData.get("service") ?? ""),
    budget: String(formData.get("budget") ?? "") || undefined,
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const localeField = formData.get("locale");
  const locale: Locale = isLocale(localeField) ? localeField : "en";

  // Doble guardia honeypot (el esquema ya lo rechaza; esto es fail-closed).
  if (data.website) {
    return { status: "error", message: "honeypot", fieldErrors: null };
  }

  if (!contactLimiter.check(ip).ok) {
    return { status: "error", message: "rate_limited", fieldErrors: null };
  }

  // ── TELEMETRÍA: se registra el lead (fecha, servicio, presupuesto) apenas
  // supera la validación, aunque luego falle el correo → mide la demanda real
  // del formulario. Best-effort: trackLead nunca lanza.
  await trackLead(data);

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    // Remitente configurable vía RESEND_FROM. Default onboarding@resend.dev
    // (solo envía a la dirección con la que registraste la cuenta en Resend);
    // al verificar un dominio propio, usa "IAZR <no-reply@tudominio.com>".
    const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

    try {
      const service = serviceLabels[data.service];

      // ── 1) LEAD: el correo crítico para IAZR (con reply_to al interesado).
      await sendEmail({
        from,
        to: siteConfig.author.email,
        replyTo: data.email,
        subject: `[IA-ZR] Solicitud: ${service} — ${data.name}`,
        text: [
          `Nombre: ${data.name}`,
          `Correo: ${data.email}`,
          `Empresa: ${data.company ?? "—"}`,
          `Servicio: ${service}`,
          `Presupuesto: ${data.budget ?? "Sin definir"}`,
          "",
          data.message,
        ].join("\n"),
      });
    } catch (error) {
      console.error("[IAZR·contacto] Error de envío:", error);
      return {
        status: "error",
        message: "delivery_failed",
        fieldErrors: null,
      };
    }

    // ── 2) AUTORESPUESTA al interesado (best-effort, nunca bloquea el lead).
    // Con el remitente por defecto (onboarding@resend.dev) solo es posible
    // cuando el visitante ES el correo registrado de la cuenta; con dominio
    // verificado (RESEND_FROM) funciona para cualquier visitante.
    const canAutoReply =
      process.env.RESEND_FROM !== undefined || data.email === siteConfig.author.email;

    if (canAutoReply) {
      try {
        const service = serviceLabels[data.service];
        await sendEmail({
          from,
          to: data.email,
          ...autoReply(locale, data.name, service),
        });
      } catch (error) {
        // El lead ya se entregó; la confirmación es un extra. Se loguea para
        // diagnóstico pero NO se convierte en error para el visitante.
        console.error(
          "[IAZR·contacto] Autorespuesta no enviada (¿remitente sin dominio verificado?):",
          error
        );
      }
    }
  }

  return {
    status: "success",
    message: "success",
    fieldErrors: null,
  };
}
