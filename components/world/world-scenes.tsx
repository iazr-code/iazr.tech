"use client";

import { NeuralCore } from "@/components/world/scenes/neural-core";
import { ProjectPortals } from "@/components/world/scenes/project-portals";

/**
 * The world's two scenes. Each one lives inside its own DOM frame: the neural
 * core beside the IA-ZR Control window, the case screens inside the cases frame.
 */
export function WorldScenes() {
  return (
    <>
      <NeuralCore />
      <ProjectPortals />
    </>
  );
}
