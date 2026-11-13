/**
 * Niveles de calidad del mundo 3D. El nivel inicial sale de las capacidades
 * del dispositivo; después PerformanceMonitor lo ajusta según los FPS reales.
 */

export type QualityTier = "high" | "medium" | "low" | "static";

export type TierEnv = {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  cores: number;
  deviceMemory?: number;
  coarsePointer: boolean;
};

export type TierSettings = {
  dpr: [number, number];
  particles: number;
  post: "full" | "light" | "none";
  textureSize: 1024 | 512;
  anisotropy: number;
};

export const TIER_SETTINGS: Record<Exclude<QualityTier, "static">, TierSettings> = {
  high: { dpr: [1, 2], particles: 24000, post: "full", textureSize: 1024, anisotropy: 8 },
  medium: { dpr: [1, 1.5], particles: 12000, post: "light", textureSize: 1024, anisotropy: 4 },
  low: { dpr: [1, 1], particles: 5000, post: "none", textureSize: 512, anisotropy: 1 },
};

export function detectInitialTier(env: TierEnv): QualityTier {
  if (env.reducedMotion || env.saveData || !env.webgl) return "static";
  const memory = env.deviceMemory ?? 8;
  if (env.cores < 4) return "low";
  if (env.coarsePointer) return memory <= 4 ? "low" : "medium";
  if (memory < 4) return "medium";
  return "high";
}

const LADDER: Exclude<QualityTier, "static">[] = ["low", "medium", "high"];

/** Sube o baja un nivel por FPS. Nunca entra ni sale de "static". */
export function stepTier(tier: QualityTier, dir: "down" | "up"): QualityTier {
  if (tier === "static") return "static";
  const i = LADDER.indexOf(tier);
  const next = dir === "down" ? Math.max(0, i - 1) : Math.min(LADDER.length - 1, i + 1);
  return LADDER[next];
}

/** Lee el entorno real del navegador (solo cliente). */
export function readTierEnv(): TierEnv {
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    webgl,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    cores: nav.hardwareConcurrency ?? 4,
    deviceMemory: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  };
}
