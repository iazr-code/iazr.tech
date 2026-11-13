import { SIMPLEX_3D } from "@/lib/world/shaders/noise";

/**
 * Entidad del hero: una nube de partículas que respira con ruido curl, se
 * deforma hacia el puntero y se dispersa al avanzar el scroll (uProgress).
 */
export const entityVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uPointer;

attribute float aSeed;
attribute float aRadius;

varying float vMix;
varying float vAlpha;

${SIMPLEX_3D}

void main() {
  vec3 base = position;
  float t = uTime * 0.12;

  // Respiración: el radio late con ruido de baja frecuencia.
  float pulse = snoise(base * 0.6 + vec3(t)) * 0.18;
  vec3 dir = normalize(base);
  vec3 p = dir * (aRadius + pulse);

  // Flujo vectorial de ruido (3 evaluaciones; el curl completo costaba 18).
  vec3 flow = snoiseVec3(p * 0.45 + vec3(t * 0.8, 0.0, aSeed * 0.01));
  p += flow * (0.22 + aSeed * 0.18);

  // Puntero: deformación suave hacia el cursor proyectado en la escena.
  vec3 toPointer = uPointer - p;
  float pull = smoothstep(2.4, 0.0, length(toPointer));
  p += normalize(toPointer + 1e-4) * pull * 0.35;

  // Dispersión con el scroll: la entidad se expande y se desvanece.
  float burst = smoothstep(0.0, 1.0, uProgress);
  p += dir * burst * (1.5 + aSeed * 4.0) + flow * burst * 1.2;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) * (1.0 / -mv.z);

  vMix = clamp(length(p) / 2.6 + flow.y * 0.25, 0.0, 1.0);
  vAlpha = (1.0 - burst * 0.85) * (0.45 + aSeed * 0.55);
}
`;

export const entityFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vMix;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float glow = pow(core, 2.2);
  vec3 color = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(color * (0.6 + glow * 1.6), glow * vAlpha);
}
`;
