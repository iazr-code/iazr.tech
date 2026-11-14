/**
 * Geometrías procedurales fusionadas (una sola BufferGeometry → 1 draw call).
 */

/** Puntos deterministas repartidos en una esfera (espiral de Fibonacci). */
export function fibonacciSphere(count: number, radius: number): Float32Array {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

/**
 * Arcos entre pares de nodos de la esfera, como pares de puntos para
 * LineSegments. Interpolación esférica con altura sin(πt): todo el arco queda
 * sobre la superficie (nunca atraviesa la esfera).
 */
export function buildArcSegments(count: number, radius: number, segments: number, lift = 0.45): Float32Array {
  const nodes = fibonacciSphere(count * 2, 1);
  const out = new Float32Array(count * segments * 2 * 3);
  let o = 0;

  const pointAt = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, t: number) => {
    const dot = Math.min(1, Math.max(-1, ax * bx + ay * by + az * bz));
    const omega = Math.acos(dot);
    let x: number, y: number, z: number;
    if (omega < 1e-5) {
      x = ax; y = ay; z = az;
    } else {
      const s = Math.sin(omega);
      const wa = Math.sin((1 - t) * omega) / s;
      const wb = Math.sin(t * omega) / s;
      x = ax * wa + bx * wb; y = ay * wa + by * wb; z = az * wa + bz * wb;
    }
    const len = Math.hypot(x, y, z) || 1;
    const h = radius * (1 + lift * Math.sin(Math.PI * t));
    return [(x / len) * h, (y / len) * h, (z / len) * h];
  };

  for (let i = 0; i < count; i += 1) {
    const a = [nodes[i * 6], nodes[i * 6 + 1], nodes[i * 6 + 2]] as const;
    // Empareja con un nodo lejano para arcos amplios.
    const j = (i + count) % (count * 2);
    const b = [nodes[j * 3], nodes[j * 3 + 1], nodes[j * 3 + 2]] as const;
    let prev = pointAt(a[0], a[1], a[2], b[0], b[1], b[2], 0);
    for (let s = 1; s <= segments; s += 1) {
      const next = pointAt(a[0], a[1], a[2], b[0], b[1], b[2], s / segments);
      out[o++] = prev[0]; out[o++] = prev[1]; out[o++] = prev[2];
      out[o++] = next[0]; out[o++] = next[1]; out[o++] = next[2];
      prev = next;
    }
  }
  return out;
}
