"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Calculator,
  CalendarCheck,
  FileDown,
  FileText,
  Fingerprint,
  Languages,
  MessageCircle,
  Mic,
  ScanLine,
  Search,
  type LucideIcon,
} from "lucide-react";

import { siteConfig } from "@/lib/data/site";
import { openBooking } from "@/lib/booking-store";
import { emit, PAGE_EVENTS, type PageEvent } from "@/lib/events";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { filterCommands, type PaletteCommand } from "@/lib/palette";
import { scrollToSection } from "@/lib/agent/run";
import { cn } from "@/lib/utils";
import { CV_URL } from "@/components/home/founder";

type Command = PaletteCommand & { icon: LucideIcon; run: () => void };

/**
 * The executive command centre: Ctrl+K / ⌘K anywhere (or the nav button)
 * opens a searchable list of real page actions. Arrow keys move, Enter runs,
 * Escape closes. Section actions use page events; off the home page they
 * first navigate there.
 */
function Palette({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = getDictionary(locale).palette;
  const nav = getDictionary(locale).nav;
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const home = `/${locale}`;
  const onHome = pathname === home;
  const other: Locale = locale === "es" ? "en" : "es";

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  const close = () => dialog.current?.close();
  const section = (id: string) => () => {
    if (onHome) scrollToSection(id);
    else router.push(`${home}#${id}`);
  };
  const pageEvent = (event: PageEvent, sectionId: string) => () => {
    if (onHome) emit(event);
    else router.push(`${home}#${sectionId}`);
  };

  const commands: Command[] = [
    { id: "roi", group: t.groups.actions, label: t.roi, keywords: t.kw.roi, icon: Calculator, run: section("roi") },
    { id: "pdf", group: t.groups.actions, label: t.pdf, keywords: t.kw.pdf, icon: FileDown, run: pageEvent(PAGE_EVENTS.roiPdf, "roi") },
    { id: "scanner", group: t.groups.actions, label: t.scanner, keywords: t.kw.scanner, icon: ScanLine, run: pageEvent(PAGE_EVENTS.scanner, "flujo") },
    { id: "voice", group: t.groups.actions, label: t.voice, keywords: t.kw.voice, icon: Mic, run: pageEvent(PAGE_EVENTS.voice, "asistente") },
    { id: "portal", group: t.groups.actions, label: t.portal, keywords: t.kw.portal, icon: Fingerprint, run: pageEvent(PAGE_EVENTS.portal, "contacto") },
    { id: "book", group: t.groups.actions, label: t.book, keywords: t.kw.book, icon: CalendarCheck, run: () => openBooking("palette") },
    { id: "cv", group: t.groups.founder, label: t.cv, keywords: t.kw.cv, icon: FileText, run: () => window.open(CV_URL, "_blank", "noopener,noreferrer") },
    { id: "certs", group: t.groups.founder, label: t.certs, keywords: t.kw.certs, icon: Award, run: () => router.push(`${home}/about#credenciales`) },
    { id: "lang", group: t.groups.prefs, label: t.lang, hint: other.toUpperCase(), keywords: t.kw.lang, icon: Languages, run: () => router.push(localizedPath(pathname, other)) },
    { id: "whatsapp", group: t.groups.prefs, label: t.whatsapp, keywords: t.kw.whatsapp, icon: MessageCircle, run: () => window.open(siteConfig.socials.whatsapp, "_blank", "noopener,noreferrer") },
    ...[
      [nav.tracks, "servicios"],
      [nav.flow, "flujo"],
      [nav.cases, "casos"],
      [nav.chat, "asistente"],
      [nav.founder, "fundador"],
      [nav.contact, "contacto"],
    ].map(([label, id]) => ({ id: `go-${id}`, group: t.groups.go, label, keywords: t.kw.go, icon: ArrowRight, run: section(id) })),
  ];

  const results = filterCommands(commands, query);
  const current = Math.min(active, Math.max(0, results.length - 1));

  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    close();
    // Run after the dialog has closed so focus and scroll land on the page.
    window.setTimeout(cmd.run, 0);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((current + dir + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(current);
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${current}`)?.scrollIntoView({ block: "nearest" });
  }, [current, listId]);

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      data-lenis-prevent
      aria-label={t.title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="app-dialog palette g-white m-auto mt-[12vh] w-[min(100%-32px,640px)] max-w-none rounded-[var(--r-lg)] border border-border p-0 max-sm:mt-[8vh]"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${current}` : undefined}
          className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="kbd max-sm:hidden">Esc</kbd>
      </div>
      <ul id={listId} role="listbox" aria-label={t.title} className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
        {results.length === 0 ? <li className="px-3 py-6 text-center text-muted-foreground">{t.empty}</li> : null}
        {results.map((cmd, i) => {
          const header = cmd.group !== lastGroup ? cmd.group : null;
          lastGroup = cmd.group;
          const Icon = cmd.icon;
          return (
            <li key={cmd.id} role="presentation">
              {header ? <p className="px-3 pb-1 pt-3 text-[13px] font-medium text-muted-foreground">{header}</p> : null}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === current}
                onMouseMove={() => setActive(i)}
                onClick={() => runAt(i)}
                className={cn("palette__item", i === current && "palette__item--on")}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                {cmd.hint ? <kbd className="kbd">{cmd.hint}</kbd> : null}
                {i === current ? <kbd className="kbd max-sm:hidden">↵</kbd> : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
        <span>
          <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> {t.move}
        </span>
        <span>
          <kbd className="kbd">↵</kbd> {t.run}
        </span>
        <span>
          <kbd className="kbd">Esc</kbd> {t.close}
        </span>
      </p>
    </dialog>
  );
}

/** The nav trigger (⌘K on Apple devices, Ctrl K elsewhere) and the global shortcut. */
export function CommandButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState(false);
  const segment = usePathname().split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        aria-label={label}
        title={label}
        className="btn btn--secondary !h-11 gap-2 !px-3 max-sm:size-11 max-sm:!p-0"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="font-mono text-[13px] max-sm:hidden">{mac ? "⌘K" : "Ctrl K"}</span>
      </button>
      {open ? <Palette locale={locale} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
