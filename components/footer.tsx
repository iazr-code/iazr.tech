import Link from "next/link";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BookingButton } from "@/components/booking/booking-button";
import { InstallButton } from "@/components/pwa/install-button";
import { PortalButton } from "@/components/passkey/portal-button";

/**
 * footer.closing: one screen. Row 1 the close (the brand line, one line, the
 * main action, then the name set across the wrap); row 2 the directory and the
 * legal row.
 */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const home = `/${locale}`;
  const sections = [
    { label: dict.nav.tracks, href: `${home}#servicios` },
    { label: dict.nav.flow, href: `${home}#flujo` },
    { label: dict.nav.roi, href: `${home}#roi` },
    { label: dict.nav.cases, href: `${home}#casos` },
    { label: dict.nav.chat, href: `${home}#asistente` },
    { label: dict.nav.founder, href: `${home}#fundador` },
    { label: dict.nav.contact, href: `${home}#contacto` },
  ];
  const contact = [
    { label: siteConfig.author.whatsappDisplay, href: siteConfig.socials.whatsapp },
    { label: siteConfig.author.email, href: siteConfig.socials.email },
    { label: "LinkedIn", href: siteConfig.socials.linkedin },
    { label: "Instagram", href: siteConfig.socials.instagram },
    { label: "GitHub", href: siteConfig.socials.github },
  ];
  const year = new Date().getFullYear();

  return (
    <footer id="cierre" data-slot="footer" className="closing g-night section flex flex-col">
      <div className="wrap flex flex-1 flex-col">
        <div>
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12 lg:items-end">
            <h2 className="t-h2 lg:col-span-8">{t.closeTitle}</h2>
            <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:col-start-9">
              <p className="text-muted-foreground">{t.closeLead}</p>
              <BookingButton source="close" className="max-sm:w-full">
                {dict.hud.book}
                <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                  <path className="m-arrow__stem" d="M1 6h8" />
                  <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
                </svg>
              </BookingButton>
            </div>
          </div>
          <p
            aria-hidden="true"
            className="t-wordmark mt-10 select-none font-display font-medium max-sm:mt-8"
          >
            IA-ZR
          </p>
        </div>

        <div className="mt-auto pt-10">
          <div className="grid gap-x-6 gap-y-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-12">
            <nav aria-label={t.footerNav} className="lg:col-span-4">
              <h3 className="t-label text-muted-foreground">{t.sections}</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                {sections.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link inline-flex min-h-11 items-center">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="lg:col-span-4 lg:col-start-6">
              <h3 className="t-label text-muted-foreground">{t.contact}</h3>
              <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {contact.map((l) => (
                  <li key={l.href} className="min-w-0">
                    <a
                      href={l.href}
                      target={l.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="link inline-flex min-h-11 max-w-full items-center truncate"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:col-start-10">
              <p className="text-[14px] text-muted-foreground">{t.location}</p>
              <PortalButton t={dict.portal} variant="link" className="text-[14px]" />
              <InstallButton label={dict.pwa.install} />
            </div>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-2 text-[13px] text-muted-foreground lg:grid-cols-12">
            <p className="lg:col-span-5">
              © {year} IA-ZR · iazr.tech · {t.rights}
            </p>
            <p className="lg:col-span-6 lg:col-start-6">{t.trademarks}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
