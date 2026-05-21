# mxsm.me

Personal site on Next.js (App Router). i18n: Russian at `/`, English at `/en`. Copy lives in `src/i18n/dictionaries/`; each section is a plate under `src/components/plates/`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

| Path | Role |
|------|------|
| `src/app/` | Layout, metadata, global styles |
| `src/components/plates/` | Six content blocks (01–06) |
| `src/components/ui/` | TitleBlock, PlateHead, GlitchText |
| `src/components/effects/` | Dust shader, scan/grain overlays |
| `src/i18n/dictionaries/` | RU / EN copy |
| `src/i18n/config.ts` | Locales, URL helpers |
| `src/middleware.ts` | `/` → ru, `/en` → en (rewrite) |
| `src/lib/shared-data.ts` | Locale-neutral links (nav, contacts, RSS URL) |
| `src/lib/episodes.ts` | RSS fetch + parse (from shitbustards.ru) |
| `src/lib/podcast-list.ts` | Top episodes for plate 04 |
| `src/signal/` | mxsm/signal runtime (WebGL + Web Audio) |
| `public/signal/samples/` | Audio samples for signal |
| `legacy/` | Original static `site.html` / `.css` / `.js` |

## Build

```bash
npm run build
npm start
```

Static export is not enabled yet; deploy as a standard Next.js app (Vercel, Node, etc.).

## SEO / OG

- Dynamic OG images: `app/[locale]/(site)/opengraph-image.tsx`, `app/[locale]/signal/opengraph-image.tsx`
- `app/sitemap.ts` — `/`, `/en`, `/signal`, `/en/signal`
- `app/robots.ts` — allows crawl + sitemap URL
- `app/icon.svg` — favicon (MU + crosshairs)

After deploy, check previews: Facebook Sharing Debugger, Telegram link paste, `https://mxsm.me/sitemap.xml`.

## Signal

Generative art lives at `/signal` (RU) and `/en/signal` (EN metadata, same experience). Sources are bundled from `src/signal/` via a client entry; samples are served from `public/signal/samples/`.

Original Vite project archived at `../mxsm.me experimets/` (optional reference).
