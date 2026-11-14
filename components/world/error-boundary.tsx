"use client";

import { Component, type ReactNode } from "react";

/** Si la escena falla (shader, textura, GPU), se degrada sin romper la página. */
export class WorldErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[IAZR·world] escena degradada a modo estático:", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
