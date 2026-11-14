"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";

import { cameraPoseAt } from "@/lib/world/camera-path";
import { curveProgress, scrollState } from "@/lib/world/scroll-store";

/**
 * Cámara guiada por el scroll: lee scrollState cada frame (sin React) y
 * amortigua posición y objetivo para un movimiento cinematográfico. Un leve
 * paralaje con el puntero da sensación de profundidad.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useRef(new Vector3());
  const desiredPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());
  const pointer = useThree((s) => s.pointer);
  const initialized = useRef(false);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const pose = cameraPoseAt(curveProgress(scrollState.progress, scrollState.ranges));
    desiredPos.current.set(pose.position[0] + pointer.x * 0.35, pose.position[1] + pointer.y * 0.2, pose.position[2]);
    desiredTarget.current.set(...pose.target);

    if (!initialized.current) {
      camera.position.copy(desiredPos.current);
      target.current.copy(desiredTarget.current);
      initialized.current = true;
    }

    const lambda = 3.2;
    camera.position.x = MathUtils.damp(camera.position.x, desiredPos.current.x, lambda, delta);
    camera.position.y = MathUtils.damp(camera.position.y, desiredPos.current.y, lambda, delta);
    camera.position.z = MathUtils.damp(camera.position.z, desiredPos.current.z, lambda, delta);
    target.current.x = MathUtils.damp(target.current.x, desiredTarget.current.x, lambda, delta);
    target.current.y = MathUtils.damp(target.current.y, desiredTarget.current.y, lambda, delta);
    target.current.z = MathUtils.damp(target.current.z, desiredTarget.current.z, lambda, delta);
    camera.lookAt(target.current);
  });

  return null;
}
