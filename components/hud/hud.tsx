"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BookingButton } from "@/components/booking/booking-button";
import { LanguageSwitch } from "@/components/hud/language-switch";
import { SoundToggle } from "@/components/hud/sound-toggle";

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
  const links = [
    { label: dict.nav.tracks, href: `${home}#servicios` },
    { label: dict.nav.flow, href: `${home}#flujo` },
    { label: dict.nav.cases, href: `${home}#casos` },
    { label: dict.nav.chat, href: `${home}#asistente` },
    { label: dict.nav.founder, href: `${home}#fundador` },
  ];

  return (
    <header data-slot="hud" className="site-nav">
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a href="#main" className="skip-link">
          {dict.nav.skip}
        </a>
        <Link href={home} aria-label="IA-ZR" className="font-display text-[20px] font-medium tracking-[-0.03em] text-foreground">
          IA-ZR
        </Link>

        <nav aria-label={dict.nav.primary} className="hidden items-center gap-7 lg:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="link text-[15px]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch className="hidden sm:flex" />
          <SoundToggle labelOn={dict.hud.soundOn} labelOff={dict.hud.soundOff} hint={dict.hud.soundHint} />
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
              <LanguageSwitch className="self-start" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
