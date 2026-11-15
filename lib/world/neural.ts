/**
 * Geometry of the hero's neural core: nodes spread evenly on a unit sphere
 * (Fibonacci lattice), each joined to its nearest neighbours. Pure, so it is
 * tested without WebGL.
 */

export type Vec3 = [number, number, number];

export type NeuralGraph = {
  nodes: Vec3[];
  edges: [number, number][];
};

export function fibonacciSphere(count: number): Vec3[] {
  const out: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return out;
}

/** Joins every node to its `k` nearest neighbours; each edge appears once. */
export function buildNeuralGraph(count: number, k = 3): NeuralGraph {
  const nodes = fibonacciSphere(count);
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const [ax, ay, az] = nodes[i];
    const near = nodes
      .map(([bx, by, bz], j) => ({ j, d: (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(i < j ? [i, j] : [j, i]);
    }
  }
  return { nodes, edges };
}

/** One semi-implicit spring step toward `target`; returns [value, velocity]. */
export function springStep(
  value: number,
  velocity: number,
  target: number,
  dt: number,
  stiffness = 60,
  damping = 11
): [number, number] {
  const step = Math.min(dt, 1 / 30);
  const accel = (target - value) * stiffness - velocity * damping;
  const v = velocity + accel * step;
  return [value + v * step, v];
}
