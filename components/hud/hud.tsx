"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, FileText, Menu, X } from "lucide-react";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { scrollState } from "@/lib/world/scroll-store";
import { cn } from "@/lib/utils";
import { BookingButton } from "@/components/booking/booking-button";
import { LanguageSwitch } from "@/components/hud/language-switch";
import { SoundToggle } from "@/components/hud/sound-toggle";

const CV_URL = "https://drive.google.com/file/d/1uXSsTCNRBIJW5D3zHWLMhyqlnwWQ69sp/view?usp=sharing";

/**
 * HUD: marca, navegación, idioma, sonido, CV y agendar, con una barra fina de
 * progreso del recorrido. La barra se actualiza en rAF leyendo scrollState
 * (sin estado de React por frame).
 */
export function Hud() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastScrolled = false;
    const tick = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${scrollState.progress})`;
      const s = window.scrollY > 24;
      if (s !== lastScrolled) {
        lastScrolled = s;
        setScrolled(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const home = `/${locale}`;
  const links = [
    { label: dict.nav.services, href: `${home}#servicios` },
    { label: dict.nav.projects, href: `${home}#proyectos` },
    { label: dict.nav.journey, href: `${home}#trayectoria` },
    { label: dict.nav.chat, href: `${home}#asistente` },
    { label: dict.nav.contact, href: `${home}#contacto` },
    { label: dict.nav.about, href: `${home}/about` },
  ];

  return (
    <header
      data-slot="hud"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "border-b border-white/10 bg-background/70 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {dict.nav.skip}
      </a>

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={home} className="font-display text-lg font-bold tracking-tight text-foreground">
          IAZR<span className="caret-blink ml-0.5 text-primary">_</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className={cn(
                "font-display text-sm font-medium transition-colors hover:text-primary",
                item.href === pathname ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitch className="hidden sm:flex" />
          <SoundToggle labelOn={dict.hud.soundOn} labelOff={dict.hud.soundOff} hint={dict.hud.soundHint} />
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary md:inline-flex"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            {dict.nav.cv}
          </a>
          <BookingButton source="hud" size="sm" className="hidden rounded-full sm:inline-flex">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {dict.hud.book}
          </BookingButton>
          <button
            type="button"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            aria-expanded={open}
            aria-controls="hud-menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-foreground lg:hidden"
          >
            {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="hud-menu" className="border-t border-white/10 px-6 py-5 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-1 font-display text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <LanguageSwitch />
              <BookingButton source="hud" size="sm" className="rounded-full">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {dict.hud.book}
              </BookingButton>
              <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                <FileText className="size-4" aria-hidden="true" />
                {dict.nav.cv}
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-primary via-accent to-primary" style={{ transform: "scaleX(0)" }} />
      </div>
    </header>
  );
}
