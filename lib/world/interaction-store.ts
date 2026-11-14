/**
 * DOM → scene interaction: the HTML is the interactive, accessible layer; the
 * 3D scene only reacts. Module state, read in useFrame.
 */
export const interactionState: {
  hoveredProject: string | null;
  hoveredService: string | null;
  /** Index of the case shown in the cases frame. */
  selectedProject: number;
} = {
  hoveredProject: null,
  hoveredService: null,
  selectedProject: 0,
};

export function setHoveredProject(id: string | null): void {
  interactionState.hoveredProject = id;
}

export function setHoveredService(id: string | null): void {
  interactionState.hoveredService = id;
}

export function setSelectedProject(index: number): void {
  interactionState.selectedProject = index;
}
