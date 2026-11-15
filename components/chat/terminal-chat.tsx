"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Eraser, Mic, Send, Square, Volume2, VolumeX, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ModelConfig } from "@/lib/ai/model-config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { siteConfig } from "@/lib/data/site";
import { detectActions, type AgentAction } from "@/lib/agent/actions";
import { runAction, scrollToSection } from "@/lib/agent/run";
import { on, PAGE_EVENTS } from "@/lib/events";
import { telemetryStore } from "@/lib/telemetry-store";
import { useVoice } from "@/components/chat/use-voice";
import { VoiceWave } from "@/components/chat/voice-wave";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TERMINAL CHAT — Motor conversacional encapsulado (Vercel AI SDK v7).
 *
 *  · useChat (cliente) + streamText (ruta /api/chat): cada token se pinta en
 *    tiempo real vía SSE → el reclutador "interroga a la red neuronal de
 *    IAZR" sin tiempos de espera clásicos.
 *  · API v4 de @ai-sdk/react: useChat() crea internamente un `Chat` con el
 *    transporte HTTP por defecto (POST /api/chat con { messages }). El input
 *    lo gestiona el componente; `sendMessage({ text })` dispara el stream.
 *  · Renderizado por `parts` (formato UI del SDK): extrae solo los partes de
 *    texto, ignorando metadatos/adjuntos.
 *  · Terminal: autoscroll controlado, cursor parpadeante durante el streaming,
 *    chips de sugerencia iniciales y botón de stop.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function TerminalChat({ dict, locale }: { dict: Dictionary["chat"]; locale: Locale }) {
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    setMessages,
    clearError,
  } = useChat();

  // El input es estado local del componente (el hook v4 no lo gestiona).
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  // Page actions the agent ran, keyed by the index of the visitor message that asked for them.
  const [notes, setNotes] = useState<Record<number, string[]>>({});
  const sentAt = useRef<number | null>(null);
  const prevStatus = useRef(status);

  const actionLabel = (a: AgentAction) =>
    a.code === "roi" ? (Object.keys(a.prefill).length ? dict.actions.roiPrefilled : dict.actions.roi) : dict.actions[a.code];

  const voice = useVoice({
    locale,
    onInterim: (text) => setInput(text),
    onFinal: (text) => submit(text),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Telemetría: modelo activo (Groq real o demo) consultado a GET /api/chat/model.
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  // Conexión real del navegador (online/offline) para el dot de estado.
  const [online, setOnline] = useState(true);

  // Estado derivado para el indicador: prioridad red > error > stream > idle.
  const connState = !online
    ? { dot: "bg-destructive", pulse: false, label: dict.statusOffline }
    : error
      ? { dot: "bg-destructive", pulse: false, label: dict.statusError }
      : status === "streaming"
        ? { dot: "bg-primary", pulse: true, label: dict.statusStreaming }
        : status === "submitted"
          ? { dot: "bg-primary/70", pulse: true, label: dict.statusSending }
          : { dot: "bg-success", pulse: false, label: dict.statusConnected };
  const rateLimited = Boolean(error?.message?.includes("rate_limited"));

  // Autoscroll: sigue la última línea mientras el stream avanza.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Evita destello de estado durante la hidratación.
  useEffect(() => setMounted(true), []);

  // Consulta el modelo activo al montar (Groq · llama-3.3-70b-versatile o demo).
  useEffect(() => {
    let active = true;
    fetch("/api/chat/model", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ModelConfig | null) => {
        if (active && data) setModelConfig(data);
      })
      .catch(() => {
        // Server caído o sin red: el badge queda en "…" y el estado de
        // conexión lo refleja el listener de online/offline del navegador.
      });
    return () => {
      active = false;
    };
  }, []);

  // Estado de conexión real: el dot se pone rojo si se pierde la red.
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  /**
   * Sends a message (typed, dictated or a suggestion). Intents the page can
   * carry out run first, client side; their codes travel with the message so
   * the model can mention them.
   */
  function submit(text: string) {
    const clean = text.trim();
    if (!clean || isLoading) return;
    const actions = detectActions(clean);
    if (actions.length) {
      setNotes((n) => ({ ...n, [messages.length]: actions.map(actionLabel) }));
      window.setTimeout(() => actions.forEach(runAction), 350);
    }
    voice.silence();
    sentAt.current = performance.now();
    void sendMessage({ text: clean }, { body: { locale, actions: actions.map((a) => a.code) } });
    setInput("");
  }

  const submitSuggestion = (text: string) => submit(text);

  // Command palette: "talk to the assistant" scrolls here and opens the microphone.
  const { listen } = voice;
  useEffect(
    () =>
      on(PAGE_EVENTS.voice, () => {
        scrollToSection("asistente");
        void listen();
      }),
    [listen]
  );

  // Measured first response (telemetry), then the spoken reply once the stream ends.
  const { speak } = voice;
  useEffect(() => {
    const before = prevStatus.current;
    prevStatus.current = status;
    if (status === "streaming" && sentAt.current !== null) {
      telemetryStore.set({ firstTokenMs: Math.round(performance.now() - sentAt.current) });
      sentAt.current = null;
    }
    if (before === "streaming" && status === "ready") {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") {
        speak(last.parts.filter((part) => part.type === "text").map((part) => part.text).join(""));
      }
    }
  }, [status, messages, speak]);

  const clearConversation = () => {
    // Reinicia el estado local del Chat: mensajes e input vuelven a vacío
    // sin recargar la página (cero fricción para el reclutador).
    setMessages([]);
    setInput("");
    setNotes({});
    voice.silence();
    clearError();
  };

  return (
    <div data-slot="terminal-chat" className="g-night window panel console-glow flex h-full min-h-[520px] w-full flex-col">
      <div className="window__bar">
        <span className="ic-tile !size-7 !rounded-[7px] bg-primary !border-0 text-[13px] font-medium text-primary-foreground" aria-hidden="true">
          IA
        </span>
        <span className="text-foreground">IA-ZR</span>
        <div className="ml-auto flex items-center gap-2">
          {mounted && (
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", connState.dot, connState.pulse && "animate-pulse")} />
              <span className="hidden sm:inline">{connState.label}</span>
            </span>
          )}
          {mounted && voice.supported.tts && (
            <button
              type="button"
              onClick={() => voice.setVoiceOn(!voice.voiceOn)}
              aria-pressed={voice.voiceOn}
              aria-label={dict.voice.replies}
              title={dict.voice.replies}
              className={cn("btn !h-9 !w-9 !p-0", voice.voiceOn ? "btn--primary" : "btn--secondary")}
            >
              {voice.voiceOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
            </button>
          )}
          {mounted && (
            <button
              type="button"
              onClick={clearConversation}
              aria-label={dict.reset}
              title={dict.reset}
              className="btn btn--secondary !h-9 !w-9 !p-0"
            >
              <Eraser className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5 max-sm:px-4"
        role="log"
        data-lenis-prevent
        aria-live="polite"
        aria-label={dict.logLabel}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end gap-5">
            <p className="max-w-[46ch] text-muted-foreground">{dict.intro}</p>
            <div className="flex flex-wrap gap-2">
              {dict.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitSuggestion(suggestion)}
                  className="btn btn--secondary !h-auto min-h-11 max-w-full !whitespace-normal !py-2.5 text-left !text-base"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="text-[13px] text-muted-foreground">
              {modelConfig === null
                ? dict.checkingModel
                : modelConfig.demo
                  ? dict.demoNote
                  : `${modelConfig.provider} · ${modelConfig.model} · ${dict.liveNote}`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");

              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex flex-col items-end gap-1.5">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-[14px] rounded-tr-[4px] bg-primary px-3.5 py-2.5 text-primary-foreground">
                      {text}
                    </p>
                    {notes[index]?.map((label) => (
                      <p key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[13px] text-muted-foreground">
                        <Zap className="size-3.5 signal" aria-hidden="true" />
                        {label}
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className="max-w-[88%] self-start whitespace-pre-wrap rounded-[14px] rounded-tl-[4px] bg-background px-3.5 py-2.5"
                >
                  {text}
                  {isLoading && message.id === messages[messages.length - 1]?.id ? (
                    <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-current align-[-2px]" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}

            {error ? (
              <div role="alert" className="rounded-[var(--r-md)] bg-destructive/10 px-4 py-3 text-base">
                <p className="font-medium text-destructive">{rateLimited ? dict.rateLimited : dict.errorTitle}</p>
                <p className="mt-1 text-muted-foreground">
                  {dict.errorBody}{" "}
                  <a href={siteConfig.socials.email} className="link">
                    {siteConfig.author.email}
                  </a>{" "}
                  {dict.or}{" "}
                  <a href={siteConfig.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="link">
                    WhatsApp
                  </a>
                </p>
                <button type="button" onClick={clearError} className="link mt-2 text-[14px]">
                  {dict.retry}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {voice.listening || voice.speaking || voice.error ? (
        <div className="flex items-center gap-3 border-t border-border px-4 py-2.5" role="status">
          <VoiceWave analyser={voice.analyser} active={voice.listening || voice.speaking} className="h-8 w-32 shrink-0 signal" />
          <span className="min-w-0 text-[14px] text-muted-foreground">
            {voice.error
              ? (dict.voice.errors[voice.error as keyof typeof dict.voice.errors] ?? dict.voice.errors.failed)
              : voice.listening
                ? dict.voice.listening
                : dict.voice.speaking}
          </span>
          {voice.speaking ? (
            <button type="button" onClick={voice.silence} className="link ml-auto shrink-0 text-[14px]">
              {dict.voice.stop}
            </button>
          ) : null}
          {voice.error ? (
            <button type="button" onClick={voice.clearError} className="link ml-auto shrink-0 text-[14px]">
              {dict.voice.dismiss}
            </button>
          ) : null}
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        {mounted ? (
          <button
            type="button"
            onClick={() => (voice.listening ? voice.stopListening() : void voice.listen())}
            aria-pressed={voice.listening}
            aria-label={voice.listening ? dict.voice.stopMic : dict.voice.mic}
            title={voice.supported.stt ? (voice.listening ? dict.voice.stopMic : dict.voice.mic) : dict.voice.errors.unsupported}
            className={cn("btn !h-12 !w-12 shrink-0 !p-0", voice.listening ? "btn--primary mic-live" : "btn--secondary")}
          >
            <Mic className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={2000}
          placeholder={dict.placeholder}
          aria-label={dict.inputLabel}
          className="h-12 min-w-0 flex-1 rounded-[var(--r-sm)] border border-input bg-background px-4 text-base outline-none transition-colors duration-150 focus-visible:border-primary"
        />
        {isLoading ? (
          <button type="button" onClick={stop} aria-label={dict.stop} className="btn btn--secondary !h-12 !w-12 shrink-0 !p-0">
            <Square className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={dict.send}
            className="btn btn--primary !h-12 !w-12 shrink-0 !p-0 disabled:opacity-40"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}
