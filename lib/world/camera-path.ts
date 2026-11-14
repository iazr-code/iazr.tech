import { CatmullRomCurve3, Vector3 } from "three";

import type { SceneId } from "@/lib/world/scroll-store";

type Vec3 = [number, number, number];

/**
 * Un keyframe por escena. El mundo se extiende hacia -Z: cada escena vive
 * alrededor de su `target` y la cámara la observa desde `position`.
 */
export const CAMERA_KEYFRAMES: { scene: SceneId; position: Vec3; target: Vec3 }[] = [
  { scene: "hero", position: [0, 0, 6], target: [0, 0, 0] },
  { scene: "services", position: [2.6, 0.6, -10], target: [0, 0, -16] },
  { scene: "projects", position: [0, 0.4, -27], target: [0, 0, -36] },
  { scene: "journey", position: [-2.4, 1.2, -50], target: [0, 0, -58] },
  { scene: "chat", position: [0, 1.6, -68], target: [0, 0.4, -76] },
  { scene: "contact", position: [0, 0, -86], target: [0, 0, -94] },
];

const positions = new CatmullRomCurve3(CAMERA_KEYFRAMES.map((k) => new Vector3(...k.position)), false, "centripetal");
const targets = new CatmullRomCurve3(CAMERA_KEYFRAMES.map((k) => new Vector3(...k.target)), false, "centripetal");

const tmp = new Vector3();

/** Pose de cámara para un progreso de curva (0..1, con clamp). */
export function cameraPoseAt(progress: number): { position: Vec3; target: Vec3 } {
  const u = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  positions.getPoint(u, tmp);
  const position: Vec3 = [tmp.x, tmp.y, tmp.z];
  targets.getPoint(u, tmp);
  return { position, target: [tmp.x, tmp.y, tmp.z] };
}

/** Centro de cada escena en el mundo (lo usan las escenas para colocarse). */
export function sceneAnchor(scene: SceneId): Vec3 {
  return CAMERA_KEYFRAMES.find((k) => k.scene === scene)?.target ?? [0, 0, 0];
}
