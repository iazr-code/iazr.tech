"use client";

/**
 * Browser speech: dictation (Web Speech API recognition, Chrome, Edge and
 * Safari) and spoken replies (speechSynthesis, all modern browsers).
 */

export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => Recognition;

export function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const SPEECH_LANG = { es: "es-CO", en: "en-US" } as const;

/** Best voice for the locale: a local voice in the exact language first, then any in that language. */
export function pickVoice(voices: SpeechSynthesisVoice[], locale: "es" | "en"): SpeechSynthesisVoice | null {
  const exact = SPEECH_LANG[locale].toLowerCase();
  const byLang = voices.filter((v) => v.lang.toLowerCase().startsWith(locale));
  return (
    byLang.find((v) => v.lang.toLowerCase() === exact && v.localService) ??
    byLang.find((v) => v.lang.toLowerCase() === exact) ??
    byLang.find((v) => v.localService) ??
    byLang[0] ??
    null
  );
}

/** Plain text for speaking: no markdown marks, links read as their label, URLs dropped. */
export function speakable(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}
