/**
 * Texturas de los portales de proyectos (gestión de VRAM):
 * · Potencia de 2 (1024×512 / 512×256), generadas en build por
 *   scripts/build-textures.mjs → mipmaps válidos y memoria predecible.
 * · Subida a GPU escalonada (una por frame) para no bloquear el hilo principal.
 */

export const PORTAL_ASPECT = 2;

/** Recorte con el aspecto dado, anclado arriba (equivale a object-top). */
export function cropRectForAspect(srcW: number, srcH: number, aspect: number): { x: number; y: number; w: number; h: number } {
  if (srcW / srcH > aspect) {
    const w = Math.round(srcH * aspect);
    return { x: Math.round((srcW - w) / 2), y: 0, w, h: srcH };
  }
  return { x: 0, y: 0, w: srcW, h: Math.round(srcW / aspect) };
}

export function portalTextureUrl(id: string, size: 1024 | 512): string {
  return `/textures/projects/${id}-${size}.webp`;
}

/** Cola de tareas con presupuesto por frame (subidas a GPU, decodificaciones…). */
export function createUploadQueue(perFrame = 1): { enqueue(task: () => void): void; flush(): number; size(): number } {
  const tasks: (() => void)[] = [];
  return {
    enqueue: (task) => {
      tasks.push(task);
    },
    flush: () => {
      let ran = 0;
      while (ran < perFrame && tasks.length > 0) {
        tasks.shift()?.();
        ran += 1;
      }
      return ran;
    },
    size: () => tasks.length,
  };
}
