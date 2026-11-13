/**
 * URL de agenda (Cal.com / Calendly) desde NEXT_PUBLIC_BOOKING_URL.
 * Solo se acepta https: cualquier otra cosa (vacío, http, javascript:, data:)
 * activa el fallback de contacto directo y nunca llega a un iframe.
 */
export function resolveBookingUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export const BOOKING_URL = resolveBookingUrl(process.env.NEXT_PUBLIC_BOOKING_URL);
