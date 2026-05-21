/** Shared types for mxsm/signal runtime */

export type PhraseRegister = "abyss" | "threshold" | "max" | "other";

export type SceneName = "NORMAL" | "BREAKING" | "VOID" | "REFORM";

export type MeaningEvent = {
  phrase: string;
  intensity: number;
  biasX: number;
  biasY: number;
};

export type AudioUpdateParams = {
  depth: number;
  pointerX: number;
  pointerY: number;
  idleMs: number;
  now: number;
  meaningPulse: number;
  coldness?: number;
};

export type VisualDrawParams = {
  time: number;
  pointerX: number;
  pointerY: number;
  depth: number;
  meaningPulse: number;
  meaningHalo: number;
  meaningFlash: number;
  driftX: number;
  driftY: number;
  startedBlend: number;
  coldness: number;
  warmth: number;
  tunnelZ: number;
  voiceMode: number;
  event4823: number;
};

export type VisualUnstableApi = {
  resize: (width: number, height: number, dpr?: number) => void;
  draw: (params: VisualDrawParams) => SceneName | undefined;
};

export type RandomFn = () => number;

export type AudioSystem = {
  ensureStarted: () => void;
  update: (params: AudioUpdateParams) => void;
  isStarted: () => boolean;
  speakPhrase?: (phrase: string) => void;
  onPhraseDissolve?: (phrase: string) => void;
  dispose: () => void;
};

export type TextLayer = {
  trigger: (phrase: string, intensity: number, now: number) => void;
  update: (
    dt: number,
    now: number,
    depth: number,
    meaningPulse: number,
  ) => void;
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    now: number,
    depth: number,
  ) => void;
};

export type SignalRuntimeModule = {
  boot: () => void;
  dispose: () => void;
};
