/** Material de borde luminoso (fresnel) para los objetos de servicio. */
export const fresnelVertex = /* glsl */ `
uniform float uTime;
uniform float uHover;
varying vec3 vNormal;
varying vec3 vView;
varying float vWave;

void main() {
  vec3 p = position;
  float wave = sin(p.y * 4.0 + uTime * 1.6) * 0.5 + 0.5;
  p += normal * wave * 0.03 * (1.0 + uHover * 2.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vWave = wave;
  gl_Position = projectionMatrix * mv;
}
`;

export const fresnelFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uHover;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vView;
varying float vWave;

void main() {
  float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
  vec3 color = mix(uColorA, uColorB, vWave);
  float intensity = f * (1.1 + uHover * 1.4) + 0.04;
  gl_FragColor = vec4(color * intensity, clamp(intensity, 0.0, 1.0) * uOpacity);
}
`;
