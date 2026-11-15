"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { frameState, planeForRect, type Rect } from "@/lib/world/frames";
import { buildNeuralGraph, springStep } from "@/lib/world/neural";
import { gyroStore, initGyro } from "@/lib/world/gyro";
import { useTier } from "@/lib/world/tier-store";
import { edgeFragment, edgeVertex, nodeFragment, nodeVertex } from "@/lib/world/shaders/neural";

const DISTANCE = 6;
const FOV = 45;
const NODES = { high: 180, medium: 140, low: 96 } as const;
/** Raw sRGB: cobalt ink and the one live blue. */
const INK = new Vector3(6 / 255, 43 / 255, 138 / 255);
const LIVE = new Vector3(61 / 255, 107 / 255, 255 / 255);

function buildGeometries(count: number) {
  const graph = buildNeuralGraph(count, 3);
  let s = 7;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };

  const nodePos = new Float32Array(graph.nodes.length * 3);
  const nodeSeed = new Float32Array(graph.nodes.length);
  const nodeActive = new Float32Array(graph.nodes.length);
  graph.nodes.forEach(([x, y, z], i) => {
    nodePos.set([x, y, z], i * 3);
    nodeSeed[i] = rand();
    nodeActive[i] = i % 23 === 5 ? 1 : 0;
  });
  const nodes = new BufferGeometry();
  nodes.setAttribute("position", new Float32BufferAttribute(nodePos, 3));
  nodes.setAttribute("aSeed", new Float32BufferAttribute(nodeSeed, 1));
  nodes.setAttribute("aActive", new Float32BufferAttribute(nodeActive, 1));

  const edgePos = new Float32Array(graph.edges.length * 6);
  const edgeSeed = new Float32Array(graph.edges.length * 2);
  const edgeT = new Float32Array(graph.edges.length * 2);
  graph.edges.forEach(([a, b], i) => {
    edgePos.set(graph.nodes[a], i * 6);
    edgePos.set(graph.nodes[b], i * 6 + 3);
    const seed = rand();
    edgeSeed[i * 2] = seed;
    edgeSeed[i * 2 + 1] = seed;
    edgeT[i * 2] = 0;
    edgeT[i * 2 + 1] = 1;
  });
  const edges = new BufferGeometry();
  edges.setAttribute("position", new Float32BufferAttribute(edgePos, 3));
  edges.setAttribute("aSeed", new Float32BufferAttribute(edgeSeed, 1));
  edges.setAttribute("aT", new Float32BufferAttribute(edgeT, 1));
  return { nodes, edges };
}

/** The element inside the hero frame that says where the core sits (CSS decides per breakpoint). */
let anchor: HTMLElement | null = null;
function readAnchor(): Rect | null {
  if (!anchor || !anchor.isConnected) anchor = document.querySelector<HTMLElement>("[data-neural-anchor]");
  if (!anchor) return null;
  const r = anchor.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/**
 * The hero's neural core: a sphere of nodes and edges that turns slowly,
 * leans toward the pointer (or the phone's tilt) on a spring, and bulges where
 * the pointer is. Pulses run along a quarter of the edges. It fades out at the
 * hero frame's foot like the frame itself.
 */
export function NeuralCore() {
  const tier = useTier();
  const count = tier === "static" ? 0 : NODES[tier];
  const group = useRef<Group>(null);
  const spring = useRef({ rx: 0, vx: 0, ry: 0, vy: 0, on: 0, spin: 0 });
  const pointerLocal = useRef(new Vector3());
  const tmp = useRef(new Vector3());
  const { pointer, gl } = useThree();

  const { nodes, edges } = useMemo(() => buildGeometries(Math.max(count, 2)), [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector3(0, 0, 9) },
      uPointerOn: { value: 0 },
      uScale: { value: 1 },
      uPixelRatio: { value: 1 },
      uSize: { value: 9 },
      uInk: { value: INK },
      uLive: { value: LIVE },
      uFade: { value: new Vector2(0, 1) },
    }),
    []
  );
  const materials = useMemo(() => {
    const common = { transparent: true, premultipliedAlpha: true, depthWrite: false, blending: NormalBlending, uniforms };
    return {
      node: new ShaderMaterial({ ...common, vertexShader: nodeVertex, fragmentShader: nodeFragment }),
      edge: new ShaderMaterial({ ...common, vertexShader: edgeVertex, fragmentShader: edgeFragment }),
    };
  }, [uniforms]);

  useEffect(() => initGyro(), []);
  useEffect(
    () => () => {
      nodes.dispose();
      edges.dispose();
    },
    [nodes, edges]
  );
  useEffect(
    () => () => {
      materials.node.dispose();
      materials.edge.dispose();
    },
    [materials]
  );

  useFrame((state, delta) => {
    const obj = group.current;
    if (!obj) return;
    const frame = frameState.rects.hero;
    const box = frame ? readAnchor() : null;
    obj.visible = Boolean(frame && box && box.y + box.h > 0 && box.y < frameState.vh);
    if (!obj.visible || !frame || !box) return;
    const el = document.querySelector<HTMLElement>('[data-world-frame="hero"]');
    if (el && !el.dataset.glReady) el.dataset.glReady = "";

    const { vw, vh } = frameState;
    const plane = planeForRect(box, vw, vh, DISTANCE, FOV);
    // Leave room inside the anchor for the pointer bulge and the breathing.
    const radius = (Math.min(plane.width, plane.height) / 2) * 0.86;
    obj.position.set(plane.x, plane.y, 0);
    obj.scale.setScalar(radius);

    // Pointer: inside the hero frame it pulls the lean and the bulge.
    const px = ((pointer.x + 1) / 2) * vw;
    const py = ((1 - pointer.y) / 2) * vh;
    const inside = px >= frame.x && px <= frame.x + frame.w && py >= frame.y && py <= frame.y + frame.h;
    const gyro = gyroStore.get();
    const s = spring.current;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const nx = inside ? Math.max(-1, Math.min(1, (px - cx) / (box.w * 1.2))) : gyro.active ? gyro.x : 0;
    const ny = inside ? Math.max(-1, Math.min(1, (py - cy) / (box.h * 1.2))) : gyro.active ? gyro.y : 0;
    // Explicit writes, not `[s.ry, s.vy] = …`: the production minifier folded those member targets to constants.
    const lean = springStep(s.ry, s.vy, nx * 0.55, delta);
    s.ry = lean[0];
    s.vy = lean[1];
    const tilt = springStep(s.rx, s.vx, ny * 0.4, delta);
    s.rx = tilt[0];
    s.vx = tilt[1];
    s.on += ((inside ? 1 : 0) - s.on) * Math.min(1, delta * 5);
    s.spin += delta * 0.07;
    obj.rotation.set(s.rx, s.spin + s.ry, 0);
    obj.updateMatrixWorld();

    // Pointer on the sphere's front face, in its local space.
    const k = (2 * DISTANCE * Math.tan((FOV * Math.PI) / 360)) / vh;
    tmp.current.set((px - vw / 2) * k, -(py - vh / 2) * k, radius * 0.85);
    pointerLocal.current.copy(obj.worldToLocal(tmp.current));

    const dpr = gl.getPixelRatio();
    const bufferH = state.size.height * dpr;
    const bottom = bufferH - (frame.y + frame.h) * dpr;
    uniforms.uFade.value.set(bottom + frame.h * 0.18 * dpr, frame.h * 0.3 * dpr);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPointer.value.lerp(pointerLocal.current, Math.min(1, delta * 8));
    uniforms.uPointerOn.value = s.on;
    uniforms.uScale.value = radius;
    uniforms.uPixelRatio.value = dpr;
    uniforms.uSize.value = Math.max(6, Math.min(12, box.w / 34));
  });

  if (count === 0) return null;
  return (
    <group ref={group}>
      <lineSegments geometry={edges} material={materials.edge} frustumCulled={false} />
      <points geometry={nodes} material={materials.node} frustumCulled={false} />
    </group>
  );
}
