"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint, KeyRound, ShieldCheck, X } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import {
  createPasskey,
  forgetIds,
  passkeySupported,
  platformAuthenticatorAvailable,
  savedIds,
  signInWithPasskey,
  type PasskeyResult,
} from "@/lib/passkey";

type T = Dictionary["portal"];

/**
 * "Client portal · biometric access": a real WebAuthn ceremony on the visitor's
 * device, labelled as a local demo (no account, no server, nothing sent).
 */
export function PasskeyDialog({ t, onClose }: { t: T; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [platform, setPlatform] = useState<boolean | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [busy, setBusy] = useState<"create" | "get" | null>(null);
  const [result, setResult] = useState<{ kind: "create" | "get"; r: PasskeyResult } | null>(null);
  const supported = typeof window !== "undefined" && passkeySupported();

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    void platformAuthenticatorAvailable().then(setPlatform);
    setHasSaved(savedIds().length > 0);
  }, []);

  const run = async (kind: "create" | "get") => {
    setBusy(kind);
    setResult(null);
    const r = kind === "create" ? await createPasskey(t.displayName) : await signInWithPasskey();
    setBusy(null);
    setResult({ kind, r });
    setHasSaved(savedIds().length > 0);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="portal-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="app-dialog g-cobalt m-auto w-[min(100%-32px,560px)] max-w-none rounded-[var(--r-lg)] border border-border p-0"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 max-sm:px-5">
        <div className="flex items-start gap-3">
          <span className="ic-tile !size-11 shrink-0 text-[var(--c-cobalt)]">
            <Fingerprint className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="portal-title" className="font-display text-xl font-medium tracking-[-0.015em]">
              {t.title}
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={() => ref.current?.close()} aria-label={t.close} className="btn btn--secondary size-11 shrink-0 !p-0">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-6 py-6 max-sm:px-5">
        <p className="text-muted-foreground">{t.body}</p>
        <p className="mt-4 flex items-center gap-2 text-[14px]">
          <span
            className="size-2 rounded-full"
            style={{ background: !supported ? "var(--destructive)" : platform ? "var(--success)" : "var(--c-signal)" }}
            aria-hidden="true"
          />
          {!supported ? t.unsupported : platform === null ? "…" : platform ? t.platformYes : t.platformNo}
        </p>

        <div className="btn-row btn-row--stack mt-6">
          <button type="button" className="btn btn--primary" disabled={!supported || busy !== null} onClick={() => void run("create")}>
            <KeyRound className="size-4" aria-hidden="true" />
            {busy === "create" ? t.waiting : t.create}
          </button>
          <button type="button" className="btn btn--secondary" disabled={!supported || busy !== null} onClick={() => void run("get")}>
            <Fingerprint className="size-4" aria-hidden="true" />
            {busy === "get" ? t.waiting : t.signIn}
          </button>
        </div>

        <div aria-live="polite" className="mt-5 min-h-6">
          {result?.r.ok ? (
            <div className="rounded-[var(--r-md)] bg-secondary p-4">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-5 signal" aria-hidden="true" />
                {result.kind === "create" ? t.created : t.verified}
              </p>
              <p className="mt-1 font-mono text-[13px] text-muted-foreground">
                {t.credential} {result.r.id.slice(0, 10)}… · {result.r.ms} ms
              </p>
            </div>
          ) : result && !result.r.ok ? (
            <p className="rounded-[var(--r-md)] bg-secondary p-4 text-[14px]">{t.errors[result.r.reason]}</p>
          ) : null}
        </div>

        <p className="mt-5 border-t border-border pt-4 text-[13px] text-muted-foreground">{t.note}</p>
        {hasSaved ? (
          <button
            type="button"
            className="link mt-2 text-[14px]"
            onClick={() => {
              forgetIds();
              setHasSaved(false);
              setResult(null);
            }}
          >
            {t.forget}
          </button>
        ) : null}
      </div>
    </dialog>
  );
}
