"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  PlaneGeometry,
  SRGBColorSpace,
  ShaderMaterial,
  Texture,
} from "three";

import { featuredProjects } from "@/lib/data/projects";
import { frameState, planeForRect } from "@/lib/world/frames";
import { TIER_SETTINGS } from "@/lib/world/quality";
import { interactionState } from "@/lib/world/interaction-store";
import { useTier } from "@/lib/world/tier-store";
import { createGeneration, createUploadQueue, portalTextureUrl } from "@/lib/world/textures";
import { portalFragment, portalVertex } from "@/lib/world/shaders/portal";

const DISTANCE = 6;
const FOV = 45;

/**
 * The cases frame as a window onto the scene: nine screens share the frame's
 * exact box. Choosing a case cross-fades to its screen with a short travel in
 * scale; the pointer ripples it. POT textures load lazily as the frame nears and
 * upload to the GPU one per frame. The HTML screenshot stays the accessible
 * fallback until the active texture is live.
 */
export function ProjectPortals() {
  const tier = useTier();
  const size = tier === "static" ? 512 : TIER_SETTINGS[tier].textureSize;
  const anisotropyCap = tier === "static" ? 1 : TIER_SETTINGS[tier].anisotropy;
  const gl = useThree((s) => s.gl);
  const group = useRef<Group>(null);
  const meshes = useRef<(Mesh | null)[]>([]);
  const active = useRef(0);
  const queue = useMemo(() => createUploadQueue(1), []);
  const loading = useRef(false);
  const generation = useMemo(() => createGeneration(), []);
  const loadedSize = useRef(0);
  const readyFlag = useRef<boolean | null>(null);

  const geometry = useMemo(() => new PlaneGeometry(1, 1, 32, 16), []);
  const materials = useMemo(
    () =>
      featuredProjects.map(
        () =>
          new ShaderMaterial({
            vertexShader: portalVertex,
            fragmentShader: portalFragment,
            transparent: true,
            premultipliedAlpha: true,
            depthWrite: false,
            uniforms: {
              uMap: { value: null as Texture | null },
              uHasMap: { value: 0 },
              uHover: { value: 0 },
              uTime: { value: 0 },
              uOpacity: { value: 0 },
            },
          })
      ),
    []
  );

  // A tier change reloads only when the texture size grows.
  useEffect(() => {
    if (size <= loadedSize.current) return;
    generation.next();
    queue.clear();
    loading.current = false;
  }, [size, generation, queue]);

  useEffect(
    () => () => {
      generation.next();
      queue.clear();
      materials.forEach((m) => {
        (m.uniforms.uMap.value as Texture | null)?.dispose();
        m.uniforms.uMap.value = null;
        m.dispose();
      });
      geometry.dispose();
      document.querySelector("[data-world-frame='cases']")?.removeAttribute("data-gl-ready");
    },
    [geometry, materials, generation, queue]
  );

  function startLoading() {
    loading.current = true;
    loadedSize.current = size;
    const gen = generation.next();
    const anisotropy = Math.min(anisotropyCap, gl.capabilities.getMaxAnisotropy());
    featuredProjects.forEach((project, i) => {
      fetch(portalTextureUrl(project.id, size))
        .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
        .then((blob) => createImageBitmap(blob, { imageOrientation: "flipY" }))
        .then((bitmap) => {
          if (!generation.isCurrent(gen)) {
            bitmap.close();
            return;
          }
          const texture = new Texture(bitmap);
          texture.flipY = false;
          texture.colorSpace = SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
          texture.anisotropy = anisotropy;
          texture.needsUpdate = true;
          queue.enqueue(() => {
            if (!generation.isCurrent(gen)) {
              texture.dispose();
              return;
            }
            gl.initTexture(texture);
            const m = materials[i];
            (m.uniforms.uMap.value as Texture | null)?.dispose();
            m.uniforms.uMap.value = texture;
            m.uniforms.uHasMap.value = 1;
          });
        })
        .catch((error) => console.warn(`[IA-ZR world] texture ${project.id} unavailable:`, error));
    });
  }

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const rect = frameState.rects.cases;
    const vh = frameState.vh;
    const near = Boolean(rect && rect.y < vh * 2.5 && rect.y + rect.h > -vh);
    if (!loading.current && near) startLoading();
    queue.flush();

    const onScreen = Boolean(rect && rect.w > 0 && rect.y < vh && rect.y + rect.h > 0);
    g.visible = onScreen;

    const target = interactionState.selectedProject;
    const ready = materials[target]?.uniforms.uHasMap.value === 1;
    if (ready !== readyFlag.current) {
      readyFlag.current = ready;
      const el = document.querySelector<HTMLElement>("[data-world-frame='cases']");
      if (ready) el?.setAttribute("data-gl-ready", "");
      else el?.removeAttribute("data-gl-ready");
    }
    if (!onScreen || !rect) return;

    const plane = planeForRect(rect, frameState.vw, vh, DISTANCE, FOV);
    g.position.set(plane.x, plane.y, 0);
    active.current = MathUtils.damp(active.current, target, 9, delta);

    featuredProjects.forEach((project, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const m = materials[i];
      const offset = Math.abs(i - active.current);
      const travel = 1 - Math.min(offset, 1) * 0.06;
      mesh.scale.set(plane.width * travel, plane.height * travel, 1);
      const hovered = interactionState.hoveredProject === project.id;
      m.uniforms.uTime.value = state.clock.elapsedTime;
      m.uniforms.uHover.value = MathUtils.damp(m.uniforms.uHover.value, hovered ? 1 : 0, 7, delta);
      m.uniforms.uOpacity.value = MathUtils.clamp(1 - offset * 1.6, 0, 1);
      mesh.visible = m.uniforms.uOpacity.value > 0.01 && m.uniforms.uHasMap.value === 1;
      mesh.renderOrder = i === target ? 2 : 1;
    });
  });

  return (
    <group ref={group}>
      {featuredProjects.map((project, i) => (
        <mesh
          key={project.id}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
