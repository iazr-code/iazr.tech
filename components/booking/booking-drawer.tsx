"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Mail, X } from "lucide-react";

import { BOOKING_URL } from "@/lib/booking";
import { closeBooking, useBookingOpen } from "@/lib/booking-store";
import { siteConfig } from "@/lib/data/site";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Drawer de agenda sobre <dialog> + showModal(): foco atrapado y fondo inerte
 * nativos, Esc cierra y el foco vuelve al botón que lo abrió. El iframe se
 * monta solo al abrir (no carga terceros hasta que el visitante lo pide).
 */
export function BookingDrawer() {
  const open = useBookingOpen();
  const ref = useRef<HTMLDialogElement>(null);
  const segment = usePathname().split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const t = getDictionary(locale).booking;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      data-lenis-prevent
      ref={ref}
      aria-labelledby="booking-title"
      onClose={() => open && closeBooking()}
      onClick={(e) => e.target === e.currentTarget && closeBooking()}
      className="booking-drawer m-0 ml-auto h-dvh max-h-none w-full max-w-xl border-l border-white/10 bg-background/95 p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {open ? (
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <h2 id="booking-title" className="font-display text-xl font-semibold tracking-tight">
                {t.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </div>
            <button
              type="button"
              onClick={closeBooking}
              aria-label={t.close}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          {BOOKING_URL ? (
            <iframe
              src={BOOKING_URL}
              title={t.iframeTitle}
              loading="lazy"
              className="min-h-0 flex-1 bg-white"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="flex flex-1 flex-col gap-4 px-6 py-8">
              <p className="font-medium">{t.fallbackTitle}</p>
              <p className="text-sm text-muted-foreground">{t.fallbackBody}</p>
              <a href={siteConfig.socials.email} className="glass-panel flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-primary/50">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <span className="font-mono text-sm">{siteConfig.author.email}</span>
              </a>
              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-primary/50"
              >
                <WhatsAppIcon className="size-5 text-primary" aria-hidden="true" />
                <span className="font-mono text-sm">{siteConfig.author.whatsappDisplay}</span>
              </a>
              <a href={`/${locale}#contacto`} onClick={closeBooking} className="mt-2 text-sm text-primary underline-offset-4 hover:underline">
                {t.fallbackForm} →
              </a>
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  );
}
