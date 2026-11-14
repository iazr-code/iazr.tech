"use client";

import { HeroEntity } from "@/components/world/scenes/hero-entity";
import { ProjectPortals } from "@/components/world/scenes/project-portals";

/**
 * The world's two scenes. Each one lives inside its own DOM frame: the hero
 * entity behind the IA-ZR Control window, the case screens inside the cases frame.
 */
export function WorldScenes() {
  return (
    <>
      <HeroEntity />
      <ProjectPortals />
    </>
  );
}
