/** Líneas con pulsos de luz que viajan por cada arco (aT = 0..1 a lo largo del arco). */
export const linesVertex = /* glsl */ `
attribute float aT;
attribute float aSeed;
varying float vT;
varying float vSeed;
void main() {
  vT = aT;
  vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const linesFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying float vT;
varying float vSeed;
void main() {
  float head = fract(uTime * (0.18 + vSeed * 0.22) + vSeed);
  float d = abs(vT - head);
  float pulse = smoothstep(0.12, 0.0, d);
  float base = 0.14;
  gl_FragColor = vec4(uColor * (base + pulse * 2.2), (base + pulse) * uOpacity);
}
`;
