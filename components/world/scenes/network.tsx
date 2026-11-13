"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group, ShaderMaterial } from "three";

import { sceneAnchor } from "@/lib/world/camera-path";
import { buildArcSegments, fibonacciSphere } from "@/lib/world/geometry";
import { linesFragment, linesVertex } from "@/lib/world/shaders/lines";
import { nearCamera } from "@/components/world/scenes/use-near-camera";

const ARCS = 28;
const SEGMENTS = 32;
const RADIUS = 2.2;

/**
 * Red neuronal del asistente IA: nodos + arcos con pulsos de luz.
 * Los arcos son UNA LineSegments con shader (antes: un <Line> por arco).
 */
export function Network() {
  const group = useRef<Group>(null);
  const anchor = sceneAnchor("chat");

  const lines = useMemo(() => {
    const positions = buildArcSegments(ARCS, RADIUS, SEGMENTS);
    const vertexCount = positions.length / 3;
    const aT = new Float32Array(vertexCount);
    const aSeed = new Float32Array(vertexCount);
    for (let arc = 0; arc < ARCS; arc += 1) {
      const seed = ((arc * 9301 + 49297) % 233280) / 233280;
      for (let s = 0; s < SEGMENTS; s += 1) {
        const v = (arc * SEGMENTS + s) * 2;
        aT[v] = s / SEGMENTS;
        aT[v + 1] = (s + 1) / SEGMENTS;
        aSeed[v] = seed;
        aSeed[v + 1] = seed;
      }
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setAttribute("aT", new Float32BufferAttribute(aT, 1));
    g.setAttribute("aSeed", new Float32BufferAttribute(aSeed, 1));
    return g;
  }, []);

  const nodes = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(fibonacciSphere(900, RADIUS), 3));
    return g;
  }, []);

  const lineMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: linesVertex,
        fragmentShader: linesFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#5ee7ff") }, uOpacity: { value: 1 } },
      }),
    []
  );

  useEffect(
    () => () => {
      lines.dispose();
      nodes.dispose();
      lineMaterial.dispose();
    },
    [lines, nodes, lineMaterial]
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.visible = nearCamera(state.camera, anchor[2]);
    if (!g.visible) return;
    lineMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    g.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group} position={anchor}>
      <lineSegments geometry={lines} material={lineMaterial} frustumCulled={false} />
      <points geometry={nodes} frustumCulled={false}>
        <pointsMaterial size={0.03} color="#9beeff" transparent opacity={0.8} depthWrite={false} blending={AdditiveBlending} />
      </points>
    </group>
  );
}
