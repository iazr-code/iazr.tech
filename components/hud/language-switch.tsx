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
    <div role="group" aria-label="Language / Idioma" className={cn("flex h-11 items-center rounded-[var(--r-btn)] bg-secondary p-1 text-[13px] font-medium", className)}>
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
              "inline-flex h-9 min-w-9 items-center justify-center rounded-[6px] px-2 uppercase transition-colors duration-150",
              active ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
