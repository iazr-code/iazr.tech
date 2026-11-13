import { describe, expect, it, vi } from "vitest";

import { createAudioEngine } from "@/lib/audio/engine";

/** AudioContext mínimo: nodos con los métodos/params que usa el motor. */
function fakeContext() {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  });
  const node = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: param(),
    detune: param(),
    gain: param(),
    Q: param(),
    type: "sine",
    buffer: null as unknown,
  });
  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    state: "running",
    destination: {},
    createOscillator: vi.fn(node),
    createGain: vi.fn(node),
    createBiquadFilter: vi.fn(node),
    createConvolver: vi.fn(node),
    createBuffer: vi.fn((channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
      numberOfChannels: channels,
      length,
    })),
    resume: vi.fn(async () => {}),
    suspend: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
  };
  return ctx;
}

function fakeDoc() {
  const listeners: Record<string, (() => void)[]> = {};
  return {
    hidden: false,
    addEventListener: (type: string, fn: () => void) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: () => void) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    fire(type: string) {
      (listeners[type] ?? []).forEach((f) => f());
    },
  };
}

describe("createAudioEngine (opt-in)", () => {
  it("creates no AudioContext before start()", () => {
    const createContext = vi.fn(() => fakeContext() as unknown as AudioContext);
    const engine = createAudioEngine({ createContext, doc: fakeDoc() });
    engine.setScene("projects");
    engine.setScrollVelocity(3);
    engine.blip("hover");
    expect(createContext).not.toHaveBeenCalled();
    expect(engine.isRunning()).toBe(false);
  });

  it("creates exactly one context on start(), even when started twice", async () => {
    const createContext = vi.fn(() => fakeContext() as unknown as AudioContext);
    const engine = createAudioEngine({ createContext, doc: fakeDoc() });
    await engine.start();
    await engine.start();
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(engine.isRunning()).toBe(true);
  });

  it("suspends when the tab is hidden and resumes when visible", async () => {
    const ctx = fakeContext();
    const doc = fakeDoc();
    const engine = createAudioEngine({ createContext: () => ctx as unknown as AudioContext, doc });
    await engine.start();
    ctx.resume.mockClear();
    doc.hidden = true;
    doc.fire("visibilitychange");
    expect(ctx.suspend).toHaveBeenCalled();
    doc.hidden = false;
    doc.fire("visibilitychange");
    expect(ctx.resume).toHaveBeenCalled();
  });

  it("stop() ramps the master gain down and stops running", async () => {
    const ctx = fakeContext();
    const engine = createAudioEngine({ createContext: () => ctx as unknown as AudioContext, doc: fakeDoc() });
    await engine.start();
    const master = ctx.createGain.mock.results[0].value;
    engine.stop();
    expect(master.gain.setTargetAtTime).toHaveBeenCalledWith(0, expect.any(Number), expect.any(Number));
    expect(engine.isRunning()).toBe(false);
  });
});
