import { SIMPLEX_3D } from "@/lib/world/shaders/noise";

/** Case screen: the real screenshot on a gently curved plane, with a liquid ripple and a slight colour split on hover. */
export const portalVertex = /* glsl */ `
uniform float uHover;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += pow(uv.x - 0.5, 2.0) * 0.25;
  p.z += sin(uv.y * 6.0 + uTime * 2.0) * 0.015 * uHover;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const portalFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uHasMap;
uniform float uHover;
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;

${SIMPLEX_3D}

void main() {
  if (uHasMap < 0.5) discard;
  vec2 uv = vUv;
  float n = snoise(vec3(uv * 3.0, uTime * 0.25));
  uv += vec2(n, snoise(vec3(uv * 3.0 + 7.0, uTime * 0.25))) * 0.008 * uHover;
  float shift = 0.003 * uHover;
  vec3 color = vec3(
    texture2D(uMap, uv + vec2(shift, 0.0)).r,
    texture2D(uMap, uv).g,
    texture2D(uMap, uv - vec2(shift, 0.0)).b
  );
  gl_FragColor = vec4(color * uOpacity, uOpacity);
}
`;
