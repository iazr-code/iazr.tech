"use client";

/**
 * Passkey (WebAuthn) demo helpers. The device really creates and checks the
 * credential (Windows Hello, Touch ID, Face ID, Android or a security key),
 * but there is no account server: the challenge is random and made here, and
 * only the credential id is kept in this browser to sign in again. A real
 * client portal verifies the signed challenge on its server.
 */

const STORE_KEY = "iazr-passkey-demo";

export type PasskeyResult = { ok: true; id: string; ms: number } | { ok: false; reason: "unsupported" | "cancelled" | "failed" | "none" };

const toB64Url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64Url = (s: string) => {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export function passkeySupported(): boolean {
  return typeof window !== "undefined" && window.isSecureContext && "PublicKeyCredential" in window && Boolean(navigator.credentials);
}

export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!passkeySupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function savedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveId(id: string) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([id, ...savedIds().filter((x) => x !== id)].slice(0, 5)));
  } catch {
    /* storage blocked: sign-in falls back to the device's own passkey picker */
  }
}

export function forgetIds(): void {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    /* nothing stored */
  }
}

const failure = (err: unknown): PasskeyResult => ({
  ok: false,
  reason: err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError") ? "cancelled" : "failed",
});

export async function createPasskey(displayName: string): Promise<PasskeyResult> {
  if (!passkeySupported()) return { ok: false, reason: "unsupported" };
  const t0 = performance.now();
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: random(32),
        rp: { name: "IA-ZR (demo)", id: window.location.hostname },
        user: { id: random(16), name: "demo@iazr.tech", displayName },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: { userVerification: "required", residentKey: "preferred" },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;
    if (!cred) return { ok: false, reason: "cancelled" };
    const id = toB64Url(cred.rawId);
    saveId(id);
    return { ok: true, id, ms: Math.round(performance.now() - t0) };
  } catch (err) {
    return failure(err);
  }
}

export async function signInWithPasskey(): Promise<PasskeyResult> {
  if (!passkeySupported()) return { ok: false, reason: "unsupported" };
  const ids = savedIds();
  const t0 = performance.now();
  try {
    const cred = (await navigator.credentials.get({
      publicKey: {
        challenge: random(32),
        rpId: window.location.hostname,
        userVerification: "required",
        allowCredentials: ids.map((id) => ({ type: "public-key" as const, id: fromB64Url(id) })),
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) return { ok: false, reason: "cancelled" };
    return { ok: true, id: toB64Url(cred.rawId), ms: Math.round(performance.now() - t0) };
  } catch (err) {
    return failure(err);
  }
}
