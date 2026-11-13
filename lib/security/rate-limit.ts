/**
 * Rate limiting por IP con ventana deslizante y TTL.
 *
 * El almacén por defecto vive en memoria: en serverless cada instancia tiene
 * el suyo, así que el límite es de "mejor esfuerzo". La interfaz
 * `RateLimitStore` permite enchufar un almacén compartido (p. ej. Upstash
 * Redis) sin tocar a los consumidores.
 */

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterMs: number };

export interface RateLimitStore {
  hit(key: string, limit: number, windowMs: number, now: number): RateLimitResult;
}

export function createMemoryStore(opts: { maxKeys?: number } = {}): RateLimitStore & { size(): number } {
  const maxKeys = opts.maxKeys ?? 5000;
  const hits = new Map<string, number[]>();

  return {
    size: () => hits.size,
    hit(key, limit, windowMs, now) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      // Reinsertar mantiene el orden de inserción como orden de uso (LRU).
      hits.delete(key);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, remaining: 0, retryAfterMs: Math.max(1, recent[0] + windowMs - now) };
      }

      recent.push(now);
      hits.set(key, recent);
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return { ok: true, remaining: limit - recent.length, retryAfterMs: 0 };
    },
  };
}

export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  store?: RateLimitStore;
  now?: () => number;
}): { check(key: string): RateLimitResult } {
  const store = opts.store ?? createMemoryStore();
  const now = opts.now ?? Date.now;
  return { check: (key) => store.hit(key, opts.limit, opts.windowMs, now()) };
}

/** IP del cliente: primer valor de x-forwarded-for (Vercel lo fija), luego x-real-ip. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get("x-real-ip")?.trim();
  return real || "unknown";
}

const TEN_MINUTES = 600_000;

export const chatLimiter = createRateLimiter({ limit: 20, windowMs: TEN_MINUTES });
export const contactLimiter = createRateLimiter({ limit: 3, windowMs: TEN_MINUTES });
/** Intentos brutos del formulario (válidos o no): freno anti-spam más laxo. */
export const contactAttemptLimiter = createRateLimiter({ limit: 20, windowMs: TEN_MINUTES });
