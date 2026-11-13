"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial, Vector3 } from "three";

import { sceneAnchor } from "@/lib/world/camera-path";
import { TIER_SETTINGS } from "@/lib/world/quality";
import { localProgress, rangeOf, scrollState } from "@/lib/world/scroll-store";
import { useTier } from "@/lib/world/tier-store";
import { entityFragment, entityVertex } from "@/lib/world/shaders/entity";

/** Geometría determinista: puntos en una cáscara gruesa (más densa en el borde). */
function buildGeometry(count: number): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const radii = new Float32Array(count);
  let s = 1337;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i += 1) {
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    positions[i * 3] = r * Math.cos(theta);
    positions[i * 3 + 1] = u;
    positions[i * 3 + 2] = r * Math.sin(theta);
    seeds[i] = rand();
    radii[i] = 1.25 + Math.pow(rand(), 0.35) * 0.65;
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  g.setAttribute("aRadius", new Float32BufferAttribute(radii, 1));
  return g;
}

export function HeroEntity() {
  const tier = useTier();
  const count = tier === "static" ? 0 : TIER_SETTINGS[tier].particles;
  const points = useRef<Points>(null);
  const pointerWorld = useRef(new Vector3());
  const { viewport, pointer, gl } = useThree();
  const anchor = sceneAnchor("hero");

  const geometry = useMemo(() => buildGeometry(count), [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: entityVertex,
        fragmentShader: entityFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 26 },
          uPointer: { value: new Vector3() },
          uColorA: { value: new Color("#5ee7ff") },
          uColorB: { value: new Color("#a78bfa") },
        },
      }),
    []
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const obj = points.current;
    if (!obj) return;
    const range = rangeOf("hero");
    const local = range ? localProgress(scrollState.progress, range) : 2;
    obj.visible = local < 1.15;
    if (!obj.visible) return;

    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uProgress.value = Math.max(0, Math.min(1, local * 0.9));
    u.uPixelRatio.value = gl.getPixelRatio();
    pointerWorld.current.set((pointer.x * viewport.width) / 2 - obj.position.x, (pointer.y * viewport.height) / 2, 0);
    u.uPointer.value.lerp(pointerWorld.current, Math.min(1, delta * 4));
    obj.rotation.y += delta * 0.05;
  });

  // En pantallas anchas la entidad se desplaza a la derecha, dejando el texto libre.
  const offsetX = viewport.aspect > 1.15 ? Math.min(3, viewport.width * 0.3) : 0;
  // En vertical (móvil) baja al pie de la pantalla: el texto queda sobre fondo limpio.
  const offsetY = viewport.aspect > 1.15 ? 0 : -viewport.height * 0.58;

  if (count === 0) return null;
  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      position={[anchor[0] + offsetX, anchor[1] + offsetY, anchor[2]]}
      scale={viewport.aspect > 1.15 ? 0.85 : 0.62}
      frustumCulled={false}
    />
  );
}
