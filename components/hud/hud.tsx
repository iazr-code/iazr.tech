"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BookingButton } from "@/components/booking/booking-button";
import { LanguageSwitch } from "@/components/hud/language-switch";
import { BrandLogo } from "@/components/brand/brand-logo";
import { InstallButton } from "@/components/pwa/install-button";
import { CommandButton } from "@/components/palette/command-palette";

/**
 * The site's one fixed bar: opaque ground, a hairline from the first paint, the
 * same at every scroll depth. Wordmark on the left line, the main action on the
 * right one. Under 1024px a 44px menu button opens a full-screen sheet.
 */
export function Hud() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const home = `/${locale}`;
  // "wide" links only fit next to the controls from 1280px up; the sheet lists them all.
  const links = [
    { label: dict.nav.tracks, href: `${home}#servicios`, wide: false },
    { label: dict.nav.flow, href: `${home}#flujo`, wide: true },
    { label: dict.nav.roi, href: `${home}#roi`, wide: false },
    { label: dict.nav.cases, href: `${home}#casos`, wide: false },
    { label: dict.nav.chat, href: `${home}#asistente`, wide: false },
    { label: dict.nav.founder, href: `${home}#fundador`, wide: true },
  ];

  return (
    <header data-slot="hud" className="site-nav">
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a href="#main" className="skip-link sr-only focus-visible:not-sr-only">
          {dict.nav.skip}
        </a>
        <Link href={home} aria-label="IA-ZR, inicio" className="shrink-0">
          <BrandLogo badge={false} className="sm:hidden" />
          <BrandLogo className="max-sm:hidden" />
        </Link>

        <nav aria-label={dict.nav.primary} className="hidden items-center gap-7 lg:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={`link text-base ${item.wide ? "hidden xl:inline-flex" : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <InstallButton label={dict.pwa.install} icon className="hidden xl:inline-flex" />
          <LanguageSwitch className="hidden sm:flex" />
          <CommandButton label={dict.palette.open} />
          <BookingButton source="hud" className="hidden sm:inline-flex">
            {dict.hud.book}
          </BookingButton>
          <button
            type="button"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            aria-expanded={open}
            aria-controls="hud-menu"
            onClick={() => setOpen((v) => !v)}
            className="btn btn--secondary size-11 !p-0 lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="hud-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--nav)] z-40 overflow-y-auto bg-background lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="wrap flex flex-col py-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-14 items-center border-b border-border font-display text-xl font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <BookingButton source="hud" className="w-full">
                {dict.hud.book}
              </BookingButton>
              <InstallButton label={dict.pwa.install} className="w-full" />
              <LanguageSwitch className="self-start" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
