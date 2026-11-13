"use client";

import { useMemo } from "react";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute } from "three";

/**
 * Raíz de las escenas del mundo. Cada escena se monta aquí y decide su
 * visibilidad según el progreso de scroll.
 */

/** Polvo ambiental a lo largo de todo el recorrido (1 draw call). */
function AmbientDust({ count = 1800 }: { count?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 30;
      positions[i * 3 + 1] = (rand() - 0.5) * 18;
      positions[i * 3 + 2] = 8 - rand() * 110;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return g;
  }, [count]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.035} color="#7fdcff" transparent opacity={0.55} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  );
}

export function WorldScenes() {
  return <AmbientDust />;
}
