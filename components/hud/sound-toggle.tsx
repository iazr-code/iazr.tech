"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { createAudioEngine, SOUND_PREF_KEY, type AudioEngine } from "@/lib/audio/engine";
import { activeScene, scrollState, type SceneId } from "@/lib/world/scroll-store";
import { cn } from "@/lib/utils";

let engine: AudioEngine | null = null;
const getEngine = () => (engine ??= createAudioEngine());

function readPref(): boolean {
  try {
    return window.localStorage.getItem(SOUND_PREF_KEY) === "on";
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off");
  } catch {
    /* almacenamiento bloqueado: la preferencia simplemente no se recuerda */
  }
}

/**
 * Botón de sonido (opt-in estricto). El audio solo arranca dentro del clic;
 * la preferencia guardada únicamente muestra una pista, nunca reproduce sola.
 */
export function SoundToggle({ labelOn, labelOff, hint }: { labelOn: string; labelOff: string; hint: string }) {
  const [on, setOn] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const raf = useRef(0);

  useEffect(() => setSuggest(readPref()), []);

  // Mientras suena: escena activa → acorde; velocidad de scroll → filtro; clics → blip.
  useEffect(() => {
    if (!on) return;
    let last: SceneId | null = null;
    const tick = () => {
      const scene = activeScene();
      if (scene !== last) {
        getEngine().setScene(scene);
        last = scene;
      }
      getEngine().setScrollVelocity(scrollState.velocity);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const onPointer = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest("a, button")) getEngine().blip("click");
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      cancelAnimationFrame(raf.current);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [on]);

  const toggle = async () => {
    const next = !on;
    if (next) await getEngine().start();
    else getEngine().stop();
    setOn(next);
    setSuggest(false);
    writePref(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? labelOff : labelOn}
      title={on ? labelOff : suggest ? hint : labelOn}
      className={cn(
        "btn btn--secondary relative size-11 !p-0",
        on && "text-foreground"
      )}
    >
      {on ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
      {on ? (
        <span aria-hidden="true" className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="sound-bar h-1 w-0.5 rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </span>
      ) : suggest ? (
        <span aria-hidden="true" className="absolute right-0.5 top-0.5 size-1.5 animate-pulse rounded-full bg-primary" />
      ) : null}
    </button>
  );
}
