"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny external store: module state that React components subscribe to and
 * plain code (WebGL frames, agent actions) reads or writes without renders.
 */
export type Store<T> = {
  get: () => T;
  set: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next) => {
      const patch = typeof next === "function" ? next(state) : next;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Subscribes to one slice of a store. `select` must return a stable value (a primitive or a stored reference). */
export function useStore<T extends object, S>(store: Store<T>, select: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(store.get())
  );
}
