import { resolveBookingUrl } from "@/lib/booking";
import { siteConfig } from "@/lib/data/site";

/**
 * Ways to reserve an implementation. A payment link is used only when its
 * NEXT_PUBLIC_CHECKOUT_* variable holds an https URL; otherwise that option
 * opens WhatsApp with a prefilled message and IA-ZR sends the verified link.
 * No card or account data ever passes through this site.
 */
export type PayMethod = "card" | "pse" | "crypto";

export const CHECKOUT_URLS: Record<PayMethod, string | null> = {
  card: resolveBookingUrl(process.env.NEXT_PUBLIC_CHECKOUT_CARD_URL),
  pse: resolveBookingUrl(process.env.NEXT_PUBLIC_CHECKOUT_PSE_URL),
  crypto: resolveBookingUrl(process.env.NEXT_PUBLIC_CHECKOUT_CRYPTO_URL),
};

export function whatsappLink(message: string): string {
  return `${siteConfig.socials.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function checkoutHref(method: PayMethod, message: string): { href: string; direct: boolean } {
  const url = CHECKOUT_URLS[method];
  return url ? { href: url, direct: true } : { href: whatsappLink(message), direct: false };
}
