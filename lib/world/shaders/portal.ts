import { SIMPLEX_3D } from "@/lib/world/shaders/noise";

/** Portal de proyecto: pantalla curva con la captura real, distorsión al hover y borde de luz. */
export const portalVertex = /* glsl */ `
uniform float uHover;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  // Pantalla curva: los bordes se acercan a la cámara.
  p.z += pow(uv.x - 0.5, 2.0) * 0.9;
  p.z += sin(uv.y * 6.0 + uTime * 2.0) * 0.02 * uHover;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const portalFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uHasMap;
uniform float uHover;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uGlow;
varying vec2 vUv;

${SIMPLEX_3D}

void main() {
  vec2 uv = vUv;
  float n = snoise(vec3(uv * 3.0, uTime * 0.25));
  // Distorsión líquida al hover.
  uv += vec2(n, snoise(vec3(uv * 3.0 + 7.0, uTime * 0.25))) * 0.012 * uHover;

  vec3 color;
  if (uHasMap > 0.5) {
    float shift = 0.002 + 0.004 * uHover;
    color = vec3(
      texture2D(uMap, uv + vec2(shift, 0.0)).r,
      texture2D(uMap, uv).g,
      texture2D(uMap, uv - vec2(shift, 0.0)).b
    );
  } else {
    // Placeholder mientras llega la textura: ruido cian tenue.
    color = uGlow * (0.08 + 0.06 * n);
  }

  float scan = 0.96 + 0.04 * sin(vUv.y * 900.0);
  vec2 edge = min(vUv, 1.0 - vUv);
  float border = 1.0 - smoothstep(0.0, 0.018, min(edge.x, edge.y * 2.0));
  float vignette = smoothstep(0.0, 0.25, min(edge.x, edge.y));
  color = color * scan * mix(0.55, 1.0, vignette) * (0.9 + 0.2 * uHover) + uGlow * border * (0.6 + uHover * 1.2);
  gl_FragColor = vec4(color, uOpacity);
}
`;
