"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, Group, ShaderMaterial } from "three";

import { sceneAnchor } from "@/lib/world/camera-path";
import { fresnelFragment, fresnelVertex } from "@/lib/world/shaders/fresnel";
import { nearCamera } from "@/components/world/scenes/use-near-camera";

/** Contacto: un portal de anillos concéntricos que invita a cruzar. */
export function ContactGate() {
  const group = useRef<Group>(null);
  const anchor = sceneAnchor("contact");
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: fresnelVertex,
        fragmentShader: fresnelFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0.4 },
          uOpacity: { value: 1 },
          uColorA: { value: new Color("#5ee7ff") },
          uColorB: { value: new Color("#a78bfa") },
        },
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.visible = nearCamera(state.camera, anchor[2]);
    if (!g.visible) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      c.rotation.z += delta * (i % 2 === 0 ? 0.15 : -0.1) * (1 + i * 0.3);
    });
  });

  return (
    <group ref={group} position={anchor}>
      {[2.6, 3.3, 4.1].map((r) => (
        <mesh key={r} material={material} rotation={[0, 0, 0]}>
          <torusGeometry args={[r, 0.025, 12, 220]} />
        </mesh>
      ))}
    </group>
  );
}
