"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  PlaneGeometry,
  SRGBColorSpace,
  ShaderMaterial,
  Texture,
  Vector3,
} from "three";

import { featuredProjects } from "@/lib/data/projects";
import { TIER_SETTINGS } from "@/lib/world/quality";
import { interactionState } from "@/lib/world/interaction-store";
import { localProgress, rangeOf, scrollState } from "@/lib/world/scroll-store";
import { useTier } from "@/lib/world/tier-store";
import { createUploadQueue, PORTAL_ASPECT, portalTextureUrl } from "@/lib/world/textures";
import { portalFragment, portalVertex } from "@/lib/world/shaders/portal";

const WIDTH = 3.2;
const DEPTH_STEP = 3.4;
const DISTANCE = 6;

/**
 * Fracción del proyecto activo según las tarjetas HTML: 2.5 = a medio camino
 * entre la tarjeta 3 y la 4 (se lee del DOM solo dentro de la sección).
 */
function readActiveIndex(): number {
  const cards = document.querySelectorAll<HTMLElement>("[data-project]");
  if (cards.length === 0) return 0;
  const vc = window.innerHeight / 2;
  const centers = Array.from(cards, (c) => {
    const r = c.getBoundingClientRect();
    return r.top + r.height / 2;
  });
  if (vc <= centers[0]) return 0;
  for (let i = 0; i < centers.length - 1; i += 1) {
    if (vc <= centers[i + 1]) return i + (vc - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
  }
  return centers.length - 1;
}

/**
 * Nueve portales que forman un túnel delante de la cámara: el proyecto activo
 * queda al frente (en el lado opuesto a su tarjeta HTML) y los demás esperan
 * en profundidad. Texturas POT cargadas en diferido y subidas a GPU una por frame.
 */
export function ProjectPortals() {
  const tier = useTier();
  const size = tier === "static" ? 512 : TIER_SETTINGS[tier].textureSize;
  const anisotropyCap = tier === "static" ? 1 : TIER_SETTINGS[tier].anisotropy;
  const gl = useThree((s) => s.gl);
  const viewport = useThree((s) => s.viewport);
  const group = useRef<Group>(null);
  const meshes = useRef<(Mesh | null)[]>([]);
  const active = useRef(0);
  const queue = useMemo(() => createUploadQueue(1), []);
  const loading = useRef(false);
  const forward = useMemo(() => new Vector3(), []);

  const geometry = useMemo(() => new PlaneGeometry(WIDTH, WIDTH / PORTAL_ASPECT, 32, 16), []);
  const materials = useMemo(
    () =>
      featuredProjects.map(
        () =>
          new ShaderMaterial({
            vertexShader: portalVertex,
            fragmentShader: portalFragment,
            transparent: true,
            depthWrite: false,
            uniforms: {
              uMap: { value: null as Texture | null },
              uHasMap: { value: 0 },
              uHover: { value: 0 },
              uTime: { value: 0 },
              uOpacity: { value: 0 },
              uGlow: { value: new Color("#5ee7ff") },
            },
          })
      ),
    []
  );

  // Liberación de GPU: texturas al cambiar de tamaño de nivel y todo al desmontar.
  useEffect(() => {
    loading.current = false;
    return () => {
      materials.forEach((m) => {
        (m.uniforms.uMap.value as Texture | null)?.dispose();
        m.uniforms.uMap.value = null;
        m.uniforms.uHasMap.value = 0;
      });
    };
  }, [size, materials]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials]
  );

  function startLoading() {
    loading.current = true;
    const anisotropy = Math.min(anisotropyCap, gl.capabilities.getMaxAnisotropy());
    featuredProjects.forEach((project, i) => {
      fetch(portalTextureUrl(project.id, size))
        .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
        // Decodificación fuera del hilo principal; la orientación ya va invertida para WebGL.
        .then((blob) => createImageBitmap(blob, { imageOrientation: "flipY" }))
        .then((bitmap) => {
          const texture = new Texture(bitmap);
          texture.flipY = false;
          texture.colorSpace = SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
          texture.anisotropy = anisotropy;
          texture.needsUpdate = true;
          queue.enqueue(() => {
            gl.initTexture(texture); // subida a GPU: una por frame
            const m = materials[i];
            m.uniforms.uMap.value = texture;
            m.uniforms.uHasMap.value = 1;
          });
        })
        .catch((error) => console.warn(`[IAZR·world] textura ${project.id} no disponible:`, error));
    });
  }

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const range = rangeOf("projects");
    const local = range ? localProgress(scrollState.progress, range) : -10;
    g.visible = local > -0.25 && local < 1.15;

    if (!loading.current && local > -0.35 && range) startLoading();
    queue.flush();
    if (!g.visible) return;

    // El túnel acompaña a la cámara.
    state.camera.getWorldDirection(forward);
    g.position.copy(state.camera.position).addScaledVector(forward, DISTANCE);
    g.quaternion.copy(state.camera.quaternion);

    active.current = MathUtils.damp(active.current, readActiveIndex(), 6, delta);
    const wide = viewport.aspect > 1.15;
    // Ancho visible a la distancia del túnel: el portal cabe en la mitad libre.
    const halfW = DISTANCE * Math.tan(MathUtils.degToRad(45 / 2)) * viewport.aspect;
    const scale = wide ? Math.min(1, (halfW * 0.92) / WIDTH) : Math.min(1, (halfW * 1.6) / WIDTH);
    const sideX = wide ? halfW * 0.44 : 0;
    const entering = MathUtils.smoothstep(local, -0.25, 0.02);
    const leaving = 1 - MathUtils.smoothstep(local, 0.97, 1.12);

    featuredProjects.forEach((project, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const m = materials[i];
      const offset = i - active.current;
      const side = i % 2 === 0 ? 1 : -1; // tarjeta par a la izquierda → portal a la derecha
      mesh.scale.setScalar(scale);
      mesh.position.set(side * sideX, wide ? -offset * 0.35 : -0.4 - offset * 0.3, -offset * DEPTH_STEP);
      mesh.rotation.y = wide ? -side * 0.18 : 0;
      const visibleness = MathUtils.clamp(1 - Math.abs(offset) * 0.45, 0, 1) * (offset < -0.7 ? 0 : 1);
      const hovered = interactionState.hoveredProject === project.id;
      m.uniforms.uTime.value = state.clock.elapsedTime;
      m.uniforms.uHover.value = MathUtils.damp(m.uniforms.uHover.value, hovered ? 1 : 0, 7, delta);
      m.uniforms.uOpacity.value = visibleness * entering * leaving * (wide ? 1 : 0.35);
      mesh.visible = m.uniforms.uOpacity.value > 0.01;
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
          renderOrder={10 - i}
        />
      ))}
    </group>
  );
}
