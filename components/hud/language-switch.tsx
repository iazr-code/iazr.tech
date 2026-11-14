"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { defaultLocale, isLocale, localizedPath, locales } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Selector ES/EN. Navegación blanda con scroll={false}: el layout raíz (y su
 * Canvas WebGL) no se remonta y la posición de lectura se conserva.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const current = isLocale(segment) ? segment : defaultLocale;

  return (
    <div role="group" aria-label="Language / Idioma" className={cn("flex items-center rounded-full border border-white/15 p-0.5 font-mono text-[11px]", className)}>
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={localizedPath(pathname, locale)}
            scroll={false}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1 uppercase tracking-wider transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
