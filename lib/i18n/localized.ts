import type { Locale } from "@/lib/i18n/config";

/** Valor con una variante por idioma. */
export type Localized<T = string> = Record<Locale, T>;

export function localize<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
