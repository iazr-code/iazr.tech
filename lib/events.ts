"use client";

/**
 * Page-wide commands (from the command palette) that a section carries out.
 * Each section listens for its own event, so the palette never reaches into
 * component state.
 */
export const PAGE_EVENTS = {
  roiPdf: "iazr:roi-pdf",
  scanner: "iazr:scanner",
  voice: "iazr:voice",
  portal: "iazr:portal",
} as const;

export type PageEvent = (typeof PAGE_EVENTS)[keyof typeof PAGE_EVENTS];

export function emit(event: PageEvent): void {
  window.dispatchEvent(new Event(event));
}

export function on(event: PageEvent, handler: () => void): () => void {
  window.addEventListener(event, handler);
  return () => window.removeEventListener(event, handler);
}
