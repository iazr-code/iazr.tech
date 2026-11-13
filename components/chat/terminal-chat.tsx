"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Eraser, Send, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ModelConfig } from "@/lib/ai/model-config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { siteConfig } from "@/lib/data/site";

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

  /** Texto del badge con el modelo activo (Groq real o mock de demo). */
  const modelLabel = modelConfig
    ? modelConfig.demo
      ? "demo · MockLanguageModelV4"
      : `groq · ${modelConfig.model}`
    : "…";

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

  /** Envía un mensaje al asistente (input libre o chip de sugerencia). */
  const submit = (text: string) => {
    if (!text.trim() || isLoading) return;
    void sendMessage({ text }, { body: { locale } });
    setInput("");
  };

  const submitSuggestion = (text: string) => {
    if (isLoading) return;
    void sendMessage({ text }, { body: { locale } });
  };

  const clearConversation = () => {
    // Reinicia el estado local del Chat: mensajes e input vuelven a vacío
    // sin recargar la página (cero fricción para el reclutador).
    setMessages([]);
    setInput("");
    clearError();
  };

  return (
    <div
      data-slot="terminal-chat"
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-terminal shadow-[0_24px_80px_-32px_rgba(0,0,0,0.8)]"
    >
      {/* ── Barra de título estilo macOS ─────────────────────────────── */}
      <div className="flex h-11 items-center gap-3 border-b border-border/70 bg-secondary/40 px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <p className="font-mono text-xs text-muted-foreground">
          iazr@neural-net:{" "}
          <span className="text-primary">~/portfolio</span>
        </p>

        {/* Indicador de estado en tiempo real: dot (conexión/stream) + modelo */}
        <div className="ml-auto flex items-center gap-2">
          {mounted && (
            <span
              title={`${modelConfig ? modelConfig.model : "…"} · ${connState.label}`}
              className="flex min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-background/40 px-2 py-1 font-mono text-[10px] text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className={cn("size-1.5 shrink-0 rounded-full", connState.dot, connState.pulse && "animate-pulse")}
                style={
                  connState.dot === "bg-success"
                    ? { boxShadow: "0 0 6px var(--success)" }
                    : undefined
                }
              />
              {/* Etiqueta de estado solo en pantallas ≥ sm (en móvil basta el dot) */}
              <span className="hidden uppercase tracking-wider sm:inline">{connState.label}</span>
              <span aria-hidden="true" className="hidden text-muted-foreground/40 sm:inline">
                ·
              </span>
              <span className="min-w-0 max-w-[150px] truncate normal-case tracking-normal text-primary">
                {modelLabel}
              </span>
            </span>
          )}
          {mounted && (
            <button
              type="button"
              onClick={clearConversation}
              aria-label={dict.reset}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Eraser className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ── Área de mensajes ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="h-[420px] overflow-y-auto px-5 py-5 font-mono text-sm leading-relaxed"
        role="log"
        aria-live="polite"
        aria-label={dict.logLabel}
      >
        {messages.length === 0 ? (
          /* Estado vacío: invitación + chips de arranque rápido */
          <div className="flex h-full flex-col justify-center gap-5">
            <div>
              <p className="text-muted-foreground">
                <span className="text-success">$</span> ./iazr --assistant
              </p>
              <p className="mt-2 text-muted-foreground/80">
                {dict.intro} <span className="caret-blink">▊</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {dict.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitSuggestion(suggestion)}
                  className="max-w-full rounded-md border border-primary/25 bg-primary/5 px-3 py-1.5 text-left text-xs text-primary transition-colors hover:bg-primary/15"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50">
              {modelConfig === null
                ? dict.checkingModel
                : modelConfig.demo
                  ? dict.demoNote
                  : `// ${modelConfig.provider} · ${modelConfig.model} — ${dict.liveNote}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");

              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex gap-3">
                    <span aria-hidden="true" className="select-none text-primary">
                      ➜
                    </span>
                    <p className="whitespace-pre-wrap text-foreground">
                      {text}
                    </p>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex gap-3">
                  <span aria-hidden="true" className="select-none text-success">
                    iazr
                  </span>
                  <div className="min-w-0 flex-1 whitespace-pre-wrap text-muted-foreground/90">
                    {text}
                    {/* Cursor parpadeante mientras se genera la respuesta */}
                    {isLoading && message.id === messages[messages.length - 1]?.id ? (
                      <span className="caret-blink text-primary">▊</span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3"
              >
                <p className="text-xs text-destructive">
                  {rateLimited ? dict.rateLimited : dict.errorTitle}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {dict.errorBody}{" "}
                  <a
                    href={siteConfig.socials.email}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {siteConfig.author.email}
                  </a>{" "}
                  {dict.or}{" "}
                  <a
                    href={siteConfig.socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    WhatsApp
                  </a>
                </p>
                <button
                  type="button"
                  onClick={clearError}
                  className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  {dict.retry}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Línea de entrada ─────────────────────────────────────────── */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-border/70 bg-secondary/20 px-4 py-3"
      >
        <span aria-hidden="true" className="select-none font-mono text-primary">
          $
        </span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={2000}
          placeholder={dict.placeholder}
          aria-label={dict.inputLabel}
          className="h-9 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            aria-label={dict.stop}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-destructive/40 text-destructive transition-colors hover:bg-destructive/10"
          >
            <Square className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={dict.send}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-all",
              input.trim()
                ? "hover:bg-primary/20 hover:shadow-[0_0_18px_-4px_var(--primary)]"
                : "opacity-40"
            )}
          >
            <Send className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}
