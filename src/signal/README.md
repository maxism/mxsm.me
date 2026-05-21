# mxsm / signal

Generative audio-visual runtime (not a portfolio page). Bundled into Next.js at `/signal` via `SignalExperience` → dynamic import of `main.js`.

- **WebGL** — `visual-unstable.js` (Gray-Scott + raymarch tunnel + post)
- **2D text** — `text-layer.js` (glitch typography, three voices)
- **Audio** — `audio/index.js` (Web Audio synthesis + samples under `/signal/samples/`)
- **Phrases** — `phrases.js`

Query `?seed=N` fixes the session RNG (see `main.js`).

Legacy Vite scaffold: `../../mxsm.me experimets/`.
