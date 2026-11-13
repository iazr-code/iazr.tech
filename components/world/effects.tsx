"use client";

import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * Post-procesado cinematográfico: bloom sutil + grano (+ viñeta en "full").
 * Solo se monta en high/medium; en low cuesta más de lo que aporta.
 */
export default function Effects({ mode }: { mode: "full" | "light" }) {
  if (mode === "full") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.9} mipmapBlur />
        <Noise opacity={0.06} premultiply blendFunction={BlendFunction.SCREEN} />
        <Vignette darkness={0.55} offset={0.3} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.2} intensity={0.6} mipmapBlur />
      <Noise opacity={0.06} premultiply blendFunction={BlendFunction.SCREEN} />
    </EffectComposer>
  );
}
