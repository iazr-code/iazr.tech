export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}

/** Primer idioma soportado del header Accept-Language, ordenado por q. */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((e) => e.lang && !Number.isNaN(e.q))
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.map((e) => e.lang).find(isLocale) ?? defaultLocale;
}

function firstSegment(pathname: string): string {
  return pathname.split("/")[1] ?? "";
}

/** Ruta destino si a la URL le falta el prefijo de idioma; null si ya lo tiene. */
export function resolveLocaleRedirect(pathname: string, acceptLanguage: string | null): string | null {
  if (isLocale(firstSegment(pathname))) return null;
  const locale = pickLocale(acceptLanguage);
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

/** Misma ruta en otro idioma: "/es/about" → "/en/about". */
export function localizedPath(pathname: string, target: Locale): string {
  const rest = isLocale(firstSegment(pathname)) ? pathname.slice(3) : pathname === "/" ? "" : pathname;
  return `/${target}${rest}`;
}
