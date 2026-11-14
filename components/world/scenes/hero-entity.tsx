"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, NormalBlending, Points, ShaderMaterial, Vector2, Vector3 } from "three";

import { frameState, planeForRect } from "@/lib/world/frames";
import { TIER_SETTINGS } from "@/lib/world/quality";
import { localProgress, rangeOf, scrollState } from "@/lib/world/scroll-store";
import { useTier } from "@/lib/world/tier-store";
import { entityFragment, entityVertex } from "@/lib/world/shaders/entity";

const DISTANCE = 6;
const FOV = 45;
/** Outer radius of the cloud in local units (aRadius tops out at 1.9 plus noise). */
const CLOUD_RADIUS = 2.1;

/** Deterministic points on a thick shell (denser at the rim). */
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

/**
 * The hero entity: a cobalt particle cloud centred on the hero frame and a
 * little wider than it, so its dots fill the frame's margins around the window.
 * It fades at the frame's foot like the frame itself.
 */
export function HeroEntity() {
  const tier = useTier();
  const count = tier === "static" ? 0 : Math.round(TIER_SETTINGS[tier].particles * 0.28);
  const points = useRef<Points>(null);
  const pointerLocal = useRef(new Vector3());
  const { pointer, gl, viewport } = useThree();

  const geometry = useMemo(() => buildGeometry(count), [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: entityVertex,
        fragmentShader: entityFragment,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        blending: NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 20 },
          uPointer: { value: new Vector3() },
          // Raw sRGB values (the canvas output is not colour-managed): cobalt ink and muted cobalt.
          uColorA: { value: new Vector3(6 / 255, 43 / 255, 138 / 255) },
          uColorB: { value: new Vector3(50 / 255, 83 / 255, 164 / 255) },
          uFade: { value: new Vector2(0, 1) },
        },
      }),
    []
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const obj = points.current;
    if (!obj) return;
    const rect = frameState.rects.hero;
    obj.visible = Boolean(rect && rect.y + rect.h > 0 && rect.y < frameState.vh);
    if (!obj.visible || !rect) return;

    const plane = planeForRect(rect, frameState.vw, frameState.vh, DISTANCE, FOV);
    // Centred on the frame's upper half, wide enough to fill the margins around the window.
    const scale = (plane.width * 0.56) / CLOUD_RADIUS;
    obj.position.set(plane.x, plane.y + plane.height * 0.12, 0);
    obj.scale.setScalar(scale);

    const dpr = gl.getPixelRatio();
    const bufferH = state.size.height * dpr;
    const bottom = bufferH - (rect.y + rect.h) * dpr;
    // Gone before the frame (and the window in it) starts fading at 82% of its height.
    material.uniforms.uFade.value.set(bottom + rect.h * 0.18 * dpr, rect.h * 0.3 * dpr);

    const range = rangeOf("hero");
    const local = range ? localProgress(scrollState.progress, range) : 0;
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uProgress.value = Math.max(0, Math.min(1, local * 0.9));
    u.uPixelRatio.value = dpr;
    u.uSize.value = 20 * Math.max(0.7, Math.min(1.3, scale));

    // Pointer in the cloud's local space.
    pointerLocal.current.set(
      ((pointer.x * viewport.width) / 2 - obj.position.x) / scale,
      ((pointer.y * viewport.height) / 2 - obj.position.y) / scale,
      0
    );
    u.uPointer.value.lerp(pointerLocal.current, Math.min(1, delta * 4));
    obj.rotation.y += delta * 0.04;
  });

  if (count === 0) return null;
  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
