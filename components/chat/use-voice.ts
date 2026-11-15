"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SPEECH_LANG, getRecognitionCtor, pickVoice, speakable, type Recognition } from "@/lib/voice";

/**
 * Dictation and spoken replies for the assistant.
 * - `listen()` starts recognition in the page language; interim words go to
 *   `onInterim`, the final sentence to `onFinal`. A parallel microphone stream
 *   feeds an AnalyserNode so the wave shows the real input level.
 * - `speak(text)` reads a reply aloud when the voice switch is on.
 */
export function useVoice({
  locale,
  onInterim,
  onFinal,
}: {
  locale: "es" | "en";
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
}) {
  const [supported, setSupported] = useState({ stt: false, tts: false });
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const rec = useRef<Recognition | null>(null);
  const media = useRef<{ stream: MediaStream; ctx: AudioContext } | null>(null);
  const handlers = useRef({ onInterim, onFinal });
  useEffect(() => {
    handlers.current = { onInterim, onFinal };
  }, [onInterim, onFinal]);

  useEffect(() => {
    setSupported({ stt: Boolean(getRecognitionCtor()), tts: "speechSynthesis" in window });
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, []);

  const releaseMic = useCallback(() => {
    media.current?.stream.getTracks().forEach((t) => t.stop());
    void media.current?.ctx.close().catch(() => undefined);
    media.current = null;
    setAnalyser(null);
  }, []);

  const stopListening = useCallback(() => {
    rec.current?.stop();
  }, []);

  const listen = useCallback(async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }
    setError(null);
    window.speechSynthesis?.cancel();
    const r = new Ctor();
    r.lang = SPEECH_LANG[locale];
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    let finalText = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      handlers.current.onInterim((finalText + interim).trim());
    };
    r.onerror = (e) => setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "silence" : "failed");
    r.onend = () => {
      setListening(false);
      releaseMic();
      rec.current = null;
      if (finalText.trim()) handlers.current.onFinal(finalText.trim());
    };
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setError("failed");
      return;
    }
    // The level meter: optional, recognition works without it.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(node);
      media.current = { stream, ctx };
      if (rec.current === r) setAnalyser(node);
      else releaseMic();
    } catch {
      /* no meter: the wave falls back to its idle motion */
    }
  }, [locale, releaseMic]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOn || !("speechSynthesis" in window)) return;
      const clean = speakable(text);
      if (!clean) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = SPEECH_LANG[locale];
      const voice = pickVoice(window.speechSynthesis.getVoices(), locale);
      if (voice) u.voice = voice;
      u.rate = 1.02;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [voiceOn, locale]
  );

  const silence = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(
    () => () => {
      rec.current?.abort();
      releaseMic();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [releaseMic]
  );

  return {
    supported,
    listening,
    speaking,
    voiceOn,
    setVoiceOn: (on: boolean) => {
      setVoiceOn(on);
      if (!on) silence();
    },
    error,
    clearError: () => setError(null),
    analyser,
    listen,
    stopListening,
    speak,
    silence,
  };
}
