# mxsm.me

Personal site on Next.js (App Router). i18n: Russian at `/`, English at `/en`. Copy lives in `src/i18n/dictionaries/`; each section is a plate under `src/components/plates/`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SITE_URL` for canonical URLs in dev.

## Structure

| Path | Role |
|------|------|
| `src/app/` | Root layout, metadata, global styles |
| `src/app/[locale]/(site)/` | Home + about (dust background, plates) |
| `src/app/[locale]/signal/` | Full-screen signal experience (separate layout) |
| `src/components/plates/` | Content blocks (01–06); plate 05 = signal stage |
| `src/components/effects/` | `BackgroundLayers`, `SignalPlateVisual`, `TimePalette` |
| `public/palette-runtime.js` | Generated palette cycle for browser (`npm run build:palette`) |
| `public/dust-init.js` | Background WebGL dust (`window.mxsmDust`) |
| `src/lib/palette-stops.json` | Single source for palette stops + cycle duration |
| `src/lib/time-palette.ts` | TS palette API (`paletteAt`, `getLivePalette`) |
| `src/i18n/dictionaries/` | RU / EN copy |
| `src/middleware.ts` | `/` → ru, `/en` → en (rewrite) |
| `src/signal/` | mxsm/signal runtime (`boot` / `dispose`) |
| `legacy/` | Original static site archive |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build:palette` | Regenerate `public/palette-runtime.js` from `palette-stops.json` |
| `npm run build` | Runs `build:palette`, then `next build` |
| `npm run lint` | ESLint on `src/` (excludes `src/signal/`) |
| `npm test` | Vitest unit tests |

## Build

```bash
npm run build
npm start
```

Deploy as a standard Next.js app (Vercel, Node, etc.).

## SEO / OG

- Dynamic OG: `app/[locale]/(site)/opengraph-image.tsx`, `app/[locale]/signal/opengraph-image.tsx`
- `app/sitemap.ts`, `app/robots.ts` — use `SITE_ORIGIN` from `NEXT_PUBLIC_SITE_URL`
- `app/icon.svg` — favicon

## Signal

Generative art at `/signal` and `/en/signal`. Client entry `src/signal/main.js` exports `boot()` / `dispose()`; home plate stores seed in `sessionStorage` on click.

Samples: `public/signal/samples/`.
