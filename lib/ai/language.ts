import type { Locale } from "@/lib/i18n/config";

/**
 * Which language a visitor wrote in (Spanish or English), from accents,
 * inverted punctuation and common function words. Returns null when the text
 * gives no signal (a name, a number), so the caller falls back to the page.
 */
const ES_WORDS = new Set(
  "que de el la los las un una para por con como cuanto cuánto cuesta precio puede pueden quiero necesito hola gracias tienen tiene es son mi mis tu su sus del al y o pero qué cómo dónde cuándo también página web negocio empresa ayuda hacer".split(" ")
);
const EN_WORDS = new Set(
  "the and what how much does do can you your i is are my me to for with of a an it this that hello hi thanks need want would could cost price website business company help make we".split(" ")
);

export function detectLanguage(text: string): Locale | null {
  const t = text.toLowerCase();
  let es = 0;
  let en = 0;
  if (/[áéíóúñ¿¡]/.test(t)) es += 2;
  for (const w of t.match(/[a-záéíóúñü]+/g) ?? []) {
    if (ES_WORDS.has(w)) es += 1;
    if (EN_WORDS.has(w)) en += 1;
  }
  if (es === en) return null;
  return es > en ? "es" : "en";
}

/** A hard instruction appended to the system prompt for this turn. */
export function languageDirective(lang: Locale): string {
  return lang === "en"
    ? "\n\n## LANGUAGE FOR THIS REPLY\nThe visitor's last message is in English. Reply ONLY in English, even though these instructions are in Spanish."
    : "\n\n## IDIOMA DE ESTA RESPUESTA\nEl último mensaje del visitante está en español. Responde SOLO en español.";
}
