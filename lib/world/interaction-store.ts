/**
 * Interacción DOM → escena: el HTML es la capa interactiva y accesible; la
 * escena 3D solo reacciona. Estado de módulo, leído en useFrame.
 */
export const interactionState: { hoveredProject: string | null; hoveredService: string | null } = {
  hoveredProject: null,
  hoveredService: null,
};

export function setHoveredProject(id: string | null): void {
  interactionState.hoveredProject = id;
}

export function setHoveredService(id: string | null): void {
  interactionState.hoveredService = id;
}
