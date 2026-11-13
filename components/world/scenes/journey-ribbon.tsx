"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, CatmullRomCurve3, Color, Group, InstancedMesh, Object3D, Vector3 } from "three";

import { sceneAnchor } from "@/lib/world/camera-path";
import { nearCamera } from "@/components/world/scenes/use-near-camera";

/**
 * Trayectoria: una hélice de luz con un nodo por hito. Todos los nodos son
 * UN InstancedMesh (1 draw call) y la hélice, una sola línea.
 */
export function JourneyRibbon({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const nodes = useRef<InstancedMesh>(null);
  const anchor = sceneAnchor("journey");

  const { curve, line } = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const t = i / 120;
      const a = t * Math.PI * 5;
      pts.push(new Vector3(Math.cos(a) * 2.2, (t - 0.5) * 7, Math.sin(a) * 2.2 - 1));
    }
    const c = new CatmullRomCurve3(pts);
    const g = new BufferGeometry().setFromPoints(c.getPoints(400));
    return { curve: c, line: g };
  }, []);

  useEffect(() => () => line.dispose(), [line]);

  useLayoutEffect(() => {
    const mesh = nodes.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const cyan = new Color("#5ee7ff");
    const violet = new Color("#a78bfa");
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      curve.getPointAt(1 - t, dummy.position);
      dummy.scale.setScalar(i === 0 ? 1.6 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, cyan.clone().lerp(violet, t));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, curve]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.visible = nearCamera(state.camera, anchor[2]);
    if (g.visible) g.rotation.y += delta * 0.06;
  });

  return (
    <group ref={group} position={anchor}>
      <line>
        <primitive object={line} attach="geometry" />
        <lineBasicMaterial color="#5ee7ff" transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} />
      </line>
      <instancedMesh ref={nodes} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
