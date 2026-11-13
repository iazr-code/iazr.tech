import type { SceneId } from "@/lib/world/scroll-store";

/**
 * Paisaje sonoro generativo (Web Audio, cero archivos).
 * OPT-IN ESTRICTO: no se crea ningún AudioContext hasta llamar start(), que
 * solo se invoca desde el clic del usuario en el botón del HUD.
 *
 * Grafo: 3 voces × 2 osciladores desafinados → low-pass (corte ligado a la
 * velocidad de scroll) → seco + reverb sintética → master (máx. 0.18).
 */

export type AudioEngine = {
  start(): Promise<void>;
  stop(): void;
  isRunning(): boolean;
  setScene(id: SceneId): void;
  setScrollVelocity(v: number): void;
  blip(kind: "hover" | "click"): void;
};

export const SOUND_PREF_KEY = "iazr.sound";

const MASTER_LEVEL = 0.18;

/** Acorde (Hz) por escena: Dm9 → Fmaj7 → Am7 → Cmaj9 → Em7 → Dsus2 (registro grave). */
const CHORDS: Record<SceneId, [number, number, number]> = {
  hero: [146.83, 220.0, 329.63],
  services: [174.61, 261.63, 329.63],
  projects: [110.0, 196.0, 261.63],
  journey: [130.81, 246.94, 293.66],
  chat: [164.81, 246.94, 293.66],
  contact: [146.83, 220.0, 329.63],
};

type Doc = Pick<Document, "hidden" | "addEventListener" | "removeEventListener">;

export function createAudioEngine(deps: { createContext?: () => AudioContext; doc?: Doc } = {}): AudioEngine {
  const createContext = deps.createContext ?? (() => new AudioContext());
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let oscillators: OscillatorNode[] = [];
  let running = false;
  let scene: SceneId = "hero";

  const doc = () => deps.doc ?? (typeof document !== "undefined" ? document : null);

  const onVisibility = () => {
    if (!ctx) return;
    if (doc()?.hidden) void ctx.suspend();
    else if (running) void ctx.resume();
  };

  function impulseResponse(context: AudioContext, seconds = 2.5): AudioBuffer {
    const length = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(2, length, context.sampleRate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
    return buffer;
  }

  function build(context: AudioContext) {
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    const reverb = context.createConvolver();
    reverb.buffer = impulseResponse(context);
    const wet = context.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet);
    wet.connect(master);

    filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.7;
    filter.connect(master);
    filter.connect(reverb);

    oscillators = [];
    CHORDS[scene].forEach((freq, voice) => {
      [-7, 7].forEach((detune) => {
        const osc = context.createOscillator();
        osc.type = voice === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = context.createGain();
        g.gain.value = voice === 0 ? 0.32 : 0.16;
        osc.connect(g);
        g.connect(filter as BiquadFilterNode);
        osc.start();
        oscillators.push(osc);
      });
    });
  }

  return {
    async start() {
      if (running) return;
      if (!ctx) {
        ctx = createContext();
        build(ctx);
        doc()?.addEventListener("visibilitychange", onVisibility);
      }
      await ctx.resume();
      running = true;
      master?.gain.setTargetAtTime(MASTER_LEVEL, ctx.currentTime, 0.8);
    },

    stop() {
      if (!ctx || !master) return;
      running = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    },

    isRunning: () => running,

    setScene(id) {
      scene = id;
      if (!ctx || !running) return;
      const chord = CHORDS[id];
      oscillators.forEach((osc, i) => osc.frequency.setTargetAtTime(chord[Math.floor(i / 2)], ctx!.currentTime, 0.7));
    },

    setScrollVelocity(v) {
      if (!ctx || !running || !filter) return;
      const cutoff = 600 + Math.min(Math.abs(v), 40) * 90;
      filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.15);
    },

    blip(kind) {
      if (!ctx || !running || !master) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = kind === "click" ? 880 : 1320;
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(kind === "click" ? 0.22 : 0.08, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.1);
    },
  };
}
