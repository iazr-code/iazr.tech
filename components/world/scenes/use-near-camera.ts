"use client";

import type { Camera } from "three";

/** Visibilidad por distancia en Z: una escena solo se dibuja cuando la cámara pasa cerca. */
export function nearCamera(camera: Camera, anchorZ: number, range = 26): boolean {
  return Math.abs(camera.position.z - anchorZ) < range;
}
