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
      className="booking-drawer m-0 ml-auto h-dvh max-h-none w-full max-w-xl border-l border-border bg-background p-0 text-foreground"
    >
      {open ? (
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <h2 id="booking-title" className="font-display text-xl font-medium tracking-[-0.015em]">
                {t.title}
              </h2>
              <p className="mt-1 text-muted-foreground">{t.description}</p>
            </div>
            <button
              type="button"
              onClick={closeBooking}
              aria-label={t.close}
              className="btn btn--secondary size-11 shrink-0 !p-0"
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
              <p className="text-muted-foreground">{t.fallbackBody}</p>
              <a href={siteConfig.socials.email} className="card flex min-h-14 items-center gap-3 rounded-[var(--r-md)] p-4 transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--p-ink)_10%,var(--p-surface))]">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <span className="text-base">{siteConfig.author.email}</span>
              </a>
              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex min-h-14 items-center gap-3 rounded-[var(--r-md)] p-4 transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--p-ink)_10%,var(--p-surface))]"
              >
                <WhatsAppIcon className="size-5 text-primary" aria-hidden="true" />
                <span className="text-base">{siteConfig.author.whatsappDisplay}</span>
              </a>
              <a href={`/${locale}#contacto`} onClick={closeBooking} className="link mt-2 self-start">
                {t.fallbackForm}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  );
}
