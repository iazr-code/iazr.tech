/**
 * Estado de scroll compartido entre el DOM (Lenis) y la escena 3D.
 * Vive en un objeto de módulo: `useFrame` lo lee cada frame sin provocar
 * renders de React.
 */

export const SCENES = ["hero", "services", "projects", "journey", "chat", "contact"] as const;
export type SceneId = (typeof SCENES)[number];

/** Rango de una sección en progreso global de scroll (0..1). */
export type SectionRange = { id: SceneId; start: number; end: number };

type SectionBox = { id: SceneId; top: number; height: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function computeSectionRanges(sections: SectionBox[], docHeight: number, viewportHeight: number): SectionRange[] {
  const scrollable = Math.max(1, docHeight - viewportHeight);
  return [...sections]
    .sort((a, b) => a.top - b.top)
    .map((s) => ({ id: s.id, start: clamp01(s.top / scrollable), end: clamp01((s.top + s.height) / scrollable) }));
}

/** Progreso local dentro de un rango (sin clamp: <0 antes, >1 después). */
export function localProgress(global: number, range: SectionRange): number {
  const span = range.end - range.start;
  if (span <= 0) return global >= range.end ? 1 : 0;
  return (global - range.start) / span;
}

/**
 * Progreso sobre la curva de cámara: el keyframe i se alcanza cuando la
 * sección i está centrada en pantalla. Monótono con el scroll.
 */
export function curveProgress(global: number, ranges: SectionRange[]): number {
  if (ranges.length < 2) return clamp01(global);
  if (global <= 0) return 0;
  if (global >= 1) return 1;
  const segments = ranges.length - 1;
  const centers = ranges.map((r) => (r.start + r.end) / 2);
  if (global <= centers[0]) return 0;
  for (let i = 0; i < segments; i += 1) {
    if (global <= centers[i + 1]) {
      const span = centers[i + 1] - centers[i];
      const t = span > 0 ? (global - centers[i]) / span : 1;
      return clamp01((i + t) / segments);
    }
  }
  return 1;
}

export const scrollState: { progress: number; velocity: number; ranges: SectionRange[] } = {
  progress: 0,
  velocity: 0,
  ranges: [],
};

export function setScroll(progress: number, velocity: number): void {
  scrollState.progress = clamp01(progress);
  scrollState.velocity = velocity;
}

/** Sección activa (la que contiene el progreso actual). */
export function activeScene(): SceneId {
  const { progress, ranges } = scrollState;
  const hit = ranges.find((r) => progress >= r.start && progress <= r.end);
  return hit?.id ?? ranges[ranges.length - 1]?.id ?? "hero";
}

/** Rango de una escena, o null si la página no la contiene (p. ej. /about). */
export function rangeOf(id: SceneId): SectionRange | null {
  return scrollState.ranges.find((r) => r.id === id) ?? null;
}

function isScene(v: string | undefined): v is SceneId {
  return (SCENES as readonly string[]).includes(v ?? "");
}

/**
 * Lee las secciones `[data-world-section]` de `root` y recalcula sus rangos al
 * redimensionar (ResizeObserver sobre el documento). Devuelve la limpieza.
 */
export function registerSections(root: HTMLElement): () => void {
  const measure = () => {
    const boxes: SectionBox[] = [];
    root.querySelectorAll<HTMLElement>("[data-world-section]").forEach((el) => {
      const id = el.dataset.worldSection;
      if (!isScene(id)) return;
      const rect = el.getBoundingClientRect();
      boxes.push({ id, top: rect.top + window.scrollY, height: rect.height });
    });
    scrollState.ranges = computeSectionRanges(boxes, document.documentElement.scrollHeight, window.innerHeight);
  };

  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(document.body);
  window.addEventListener("resize", measure);
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", measure);
  };
}
