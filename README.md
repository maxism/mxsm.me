# mxsm.me

Personal site on Next.js (App Router). i18n: Russian at `/`, English at `/en`. Copy lives in `src/i18n/dictionaries/`; each section is a plate under `src/components/plates/`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3030](http://localhost:3030).

Optional: copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SITE_URL` for canonical URLs in dev.

## Structure

| Path                                  | Role                                                           |
| ------------------------------------- | -------------------------------------------------------------- |
| `src/app/`                            | Metadata, global styles, `global-not-found` (the 404)          |
| `src/app/[locale]/(site)/`            | Home + about (dust background, plates)                         |
| `src/app/[locale]/signal/`            | Full-screen signal experience (separate layout)                |
| `src/components/plates/`              | Content blocks (01–07): signal, mask, rug, …                   |
| `src/components/layout/RootShell.tsx` | The one `<html>`: fonts, palette, analytics; `lang` per locale |
| `src/components/effects/`             | `BackgroundLayers`, `SignalPlateVisual`, `TimePalette`         |
| `src/components/not-found/`           | The 404: cut number, live map, a rug woven on load             |
| `src/lib/rug/`                        | Rug generator: six schools, ASCII and SVG output               |
| `public/mask/`                        | Meshopt-compressed GLB masks (`scripts/pack-mask-glb.mjs`)     |
| `public/mediapipe/`                   | FaceLandmarker model; the wasm is copied from `node_modules`   |
| `public/palette-runtime.js`           | Generated palette cycle for browser (`npm run build:palette`)  |
| `public/dust-init.js`                 | Background WebGL dust (`window.mxsmDust`)                      |
| `src/lib/palette-stops.json`          | Single source for palette stops + cycle duration               |
| `src/lib/time-palette.ts`             | TS palette API (`paletteAt`, `getLivePalette`)                 |
| `src/i18n/dictionaries/`              | RU / EN copy                                                   |
| `src/proxy.ts`                        | `/` → ru, `/en` → en (rewrite, sets `x-mxsm-locale`)           |
| `src/signal/`                         | mxsm/signal runtime (`boot` / `dispose`)                       |

## Scripts

| Command                   | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`             | Dev server                                                              |
| `npm run build:palette`   | Regenerate `public/palette-runtime.js` from `palette-stops.json`        |
| `npm run build:mediapipe` | Copy the FaceLandmarker wasm into `public/mediapipe/` (also on install) |
| `npm run build`           | Runs both of the above, then `next build` (Turbopack)                   |
| `npm run lint`            | ESLint on `src/` (excludes `src/signal/`)                               |
| `npm run typecheck`       | `tsc --noEmit` on TypeScript 7 (the project itself stays on 5.9)        |
| `npm test`                | Vitest unit tests                                                       |

## Build

```bash
npm run build
npm start
```

Deploy as a standard Next.js app (Vercel, Node, etc.).

## SEO / OG

- Dynamic OG: `src/app/og/[locale]/[page]/route.tsx` (renders `/og/<locale>/<page>`)
- `app/sitemap.ts`, `app/robots.ts` — use `SITE_ORIGIN` from `NEXT_PUBLIC_SITE_URL`
- `app/icon.png`, `app/apple-icon.png` — favicon (from `public/signal-favicon.png`, signal slash)

## Signal

Generative art at `/signal` and `/en/signal`. Client entry `src/signal/main.js` exports `boot()` / `dispose()`; home plate stores seed in `sessionStorage` on click.

Samples: `public/signal/samples/` (Ogg Opus).
