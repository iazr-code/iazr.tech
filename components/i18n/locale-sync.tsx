"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * Sincroniza <html lang> con el idioma de la ruta. El layout raíz (que aloja
 * el Canvas persistente) no puede leer el segmento [locale], así que el
 * atributo se ajusta en cliente tras cada navegación blanda.
 */
export function LocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const segment = pathname.split("/")[1];
    document.documentElement.lang = isLocale(segment) ? segment : defaultLocale;
  }, [pathname]);

  return null;
}
