"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, Group, MathUtils, ShaderMaterial } from "three";

import { services } from "@/lib/data/services";
import { sceneAnchor } from "@/lib/world/camera-path";
import { interactionState } from "@/lib/world/interaction-store";
import { fresnelFragment, fresnelVertex } from "@/lib/world/shaders/fresnel";
import { nearCamera } from "@/components/world/scenes/use-near-camera";

/** Una forma por servicio, en arco alrededor del ancla de la escena. */
const LAYOUT: { position: [number, number, number]; shape: "ico" | "knot" | "octa" | "torus" }[] = [
  { position: [-3.2, 1.0, -1.5], shape: "ico" },
  { position: [3.4, 1.2, -2.5], shape: "knot" },
  { position: [-2.6, -1.6, 1.0], shape: "octa" },
  { position: [2.8, -1.4, 0.5], shape: "torus" },
];

function makeMaterial(a: string, b: string) {
  return new ShaderMaterial({
    vertexShader: fresnelVertex,
    fragmentShader: fresnelFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uOpacity: { value: 1 },
      uColorA: { value: new Color(a) },
      uColorB: { value: new Color(b) },
    },
  });
}

export function ServiceForms() {
  const group = useRef<Group>(null);
  const meshes = useRef<(Group | null)[]>([]);
  const anchor = sceneAnchor("services");
  const materials = useMemo(
    () => LAYOUT.map((_, i) => (i % 2 === 0 ? makeMaterial("#5ee7ff", "#a78bfa") : makeMaterial("#a78bfa", "#5ee7ff"))),
    []
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.visible = nearCamera(state.camera, anchor[2]);
    if (!g.visible) return;
    const t = state.clock.elapsedTime;
    LAYOUT.forEach((_, i) => {
      const m = materials[i];
      const hovered = interactionState.hoveredService === services[i]?.id;
      m.uniforms.uTime.value = t;
      m.uniforms.uHover.value = MathUtils.damp(m.uniforms.uHover.value, hovered ? 1 : 0, 6, delta);
      const mesh = meshes.current[i];
      if (mesh) {
        mesh.rotation.x += delta * (0.12 + i * 0.03);
        mesh.rotation.y += delta * (0.18 + i * 0.02);
        mesh.position.y = LAYOUT[i].position[1] + Math.sin(t * 0.6 + i) * 0.18;
        const s = 1 + m.uniforms.uHover.value * 0.18;
        mesh.scale.setScalar(s);
      }
    });
  });

  return (
    <group ref={group} position={anchor}>
      {LAYOUT.map((item, i) => (
        <group key={item.shape} ref={(el) => { meshes.current[i] = el; }} position={item.position}>
          <mesh material={materials[i]}>
            {item.shape === "ico" ? <icosahedronGeometry args={[0.95, 2]} /> : null}
            {item.shape === "knot" ? <torusKnotGeometry args={[0.62, 0.2, 160, 20]} /> : null}
            {item.shape === "octa" ? <octahedronGeometry args={[0.95, 0]} /> : null}
            {item.shape === "torus" ? <torusGeometry args={[0.75, 0.24, 32, 96]} /> : null}
          </mesh>
        </group>
      ))}
    </group>
  );
}
