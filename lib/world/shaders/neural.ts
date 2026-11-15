/**
 * Neural core shaders. Nodes and edges share one displacement, so the lines
 * stay attached to their nodes while the sphere breathes and bulges toward the
 * pointer. Output is premultiplied (the canvas composites premultiplied alpha)
 * and colours are raw sRGB (the output is not colour-managed). No bloom.
 */

const SHARED = /* glsl */ `
uniform float uTime;
uniform vec3 uPointer;
uniform float uPointerOn;
uniform float uScale;

vec3 displace(vec3 p, float seed) {
  vec3 dir = normalize(p);
  float breathe = sin(uTime * 0.9 + seed * 6.2831) * 0.025;
  float d = distance(p, uPointer);
  float bulge = exp(-(d * d) / 0.28) * uPointerOn;
  return dir * (1.0 + breathe + bulge * 0.2);
}

/* 0 at the back of the sphere, 1 at the front (view space). */
float frontness(vec4 mv) {
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  return smoothstep(-1.0, 1.0, (mv.z - c.z) / max(uScale, 1e-4));
}
`;

export const nodeVertex = /* glsl */ `
${SHARED}
uniform float uPixelRatio;
uniform float uSize;
attribute float aSeed;
attribute float aActive;
varying float vFront;
varying float vActive;
varying float vSeed;

void main() {
  vec3 p = displace(position, aSeed);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFront = frontness(mv);
  vActive = aActive;
  vSeed = aSeed;
  float size = uSize * (0.75 + aSeed * 0.5) * (1.0 + aActive * 0.9);
  gl_PointSize = size * uPixelRatio * (0.55 + vFront * 0.45);
}
`;

export const nodeFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uLive;
uniform vec2 uFade;
uniform float uTime;
varying float vFront;
varying float vActive;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float disc = smoothstep(0.5, 0.36, d);
  float beat = 0.6 + 0.4 * sin(uTime * 2.4 + vSeed * 12.0);
  vec3 color = mix(uInk, uLive, vActive * beat);
  float fade = smoothstep(uFade.x, uFade.x + uFade.y, gl_FragCoord.y);
  float a = disc * mix(0.22, 0.95, vFront) * fade;
  gl_FragColor = vec4(color * a, a);
}
`;

export const edgeVertex = /* glsl */ `
${SHARED}
attribute float aSeed;
attribute float aT;
varying float vFront;
varying float vSeed;
varying float vT;

void main() {
  vec3 p = displace(position, aSeed);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vFront = frontness(mv);
  vSeed = aSeed;
  vT = aT;
}
`;

export const edgeFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uLive;
uniform vec2 uFade;
uniform float uTime;
varying float vFront;
varying float vSeed;
varying float vT;

void main() {
  /* About a quarter of the edges carry a pulse that runs node to node. */
  float carries = step(vSeed, 0.26);
  float head = fract(uTime * (0.22 + vSeed * 0.5) + vSeed * 7.0);
  float pulse = carries * smoothstep(0.16, 0.0, abs(vT - head));
  vec3 color = mix(uInk, uLive, pulse);
  float fade = smoothstep(uFade.x, uFade.x + uFade.y, gl_FragCoord.y);
  float a = (mix(0.06, 0.3, vFront) + pulse * 0.6 * vFront) * fade;
  gl_FragColor = vec4(color * a, a);
}
`;
