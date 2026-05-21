# mxsm.me — задачи для кодинг-агента

> Высокий и средний приоритет по результатам архитектурного ревью.  
> Рекомендуемый порядок: **TASK-1 → TASK-2 → TASK-3**, затем **TASK-4–11**.

---

## Definition of Done (для всех тасков)

- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — success
- [ ] Нет unrelated changes
- [ ] Коммит только если пользователь попросит

---

## Порядок выполнения и зависимости

| Wave | Tasks | Можно параллельно |
|------|-------|-------------------|
| 1 | TASK-1, TASK-2, TASK-3 | ✅ |
| 2 | TASK-4, TASK-6, TASK-7, TASK-8, TASK-9 | ✅ |
| 3 | TASK-5 (после CI), TASK-10 (после TASK-1), TASK-11 (после TASK-3) | частично |

**Зависимости:**

- TASK-1 → TASK-10 (signal types)
- TASK-3 → TASK-11 (metadata factory)
- TASK-4 → TASK-5 (CI перед тестами)

---

## 🔴 Высокий приоритет

### TASK-1: Lifecycle signal runtime — `dispose()` при unmount

**Проблема:** `SignalExperience` динамически импортирует `src/signal/main.js`, но при уходе со страницы rAF, listeners и WebGL/audio не очищаются.

**Файлы:**

- `src/signal/main.js`
- `src/components/signal/SignalExperience.tsx`
- опционально: `src/signal/types.d.ts`

**Шаги:**

1. В `main.js` вынести инициализацию в функцию `boot()` (или оставить side-effect, но экспортировать cleanup).
2. Экспортировать `dispose()` / `destroy()`, которая:
   - отменяет `requestAnimationFrame`;
   - снимает все `window.addEventListener` (resize, pointerdown, pointermove);
   - останавливает audio (`audio.dispose?.()` или аналог в `src/signal/audio/`);
   - уничтожает WebGL context (`webglRoom.dispose?.()`);
   - удаляет `#room-layer` из DOM;
   - сбрасывает `document.title` в `'mxsm'`;
   - помечает runtime как неактивный (guard против повторного boot).
3. В `SignalExperience.tsx`:

   ```tsx
   useEffect(() => {
     let disposed = false;
     import("@/signal/main.js").then((mod) => {
       if (disposed) mod.dispose?.();
       else mod.boot?.();
     });
     return () => {
       disposed = true;
       import("@/signal/main.js").then((mod) => mod.dispose?.());
     };
   }, []);
   ```

4. Проверить React Strict Mode (double mount): второй mount не должен оставлять два rAF loop.

**Критерии приёмки:**

- [ ] При navigation `/signal` → `/` rAF не продолжается
- [ ] `#room-layer` удалён из DOM после unmount
- [ ] Повторный заход на `/signal` работает корректно
- [ ] `npm run build` проходит

---

### TASK-2: Client-side `signalSeed` вместо server-side random

**Проблема:** `Math.random()` в `page.tsx` вызывается при SSG/revalidate — seed один на всех посетителей до следующего revalidate.

**Файлы:**

- `src/app/[locale]/(site)/page.tsx`
- `src/components/plates/HomePlates.tsx`
- `src/components/plates/PlateSignal.tsx`
- `src/components/effects/SignalPlateVisual.tsx`

**Шаги:**

1. Убрать `signalSeed` из `page.tsx` и prop chain (`HomePlates` → `PlateSignal`).
2. В `SignalPlateVisual` (client component) генерировать seed при mount:

   ```tsx
   const [seed] = useState(() => Math.floor(Math.random() * 2147483646) + 1);
   ```

3. Сохранить существующий flow: `sessionStorage.setItem(SIGNAL_SEED_KEY, String(seed))` on click.
4. Убедиться, что `main.js` по-прежнему читает seed из sessionStorage / URL param.

**Критерии приёмки:**

- [ ] `page.tsx` не содержит `Math.random()`
- [ ] Каждый reload главной даёт новый seed на превью-плашке
- [ ] Клик по portal → `/signal` передаёт тот же seed через sessionStorage
- [ ] SSG home page остаётся static (`● /[locale]` в build output)

---

### TASK-3: Единый `SITE_ORIGIN` + env var

**Проблема:** `https://mxsm.me` захардкожен в 3+ местах.

**Файлы:**

- `src/lib/seo/site-url.ts`
- `src/app/[locale]/(site)/layout.tsx`
- `src/app/[locale]/signal/page.tsx`
- `src/app/[locale]/(site)/about/page.tsx`
- `src/app/robots.ts`
- `.env.example` (создать)

**Шаги:**

1. В `site-url.ts`:

   ```ts
   export const SITE_ORIGIN =
     process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mxsm.me";
   ```

2. Заменить все hardcoded URL на `SITE_ORIGIN` / `absoluteUrl()`.
3. В metadata layouts: `metadataBase: new URL(SITE_ORIGIN)`.
4. В `robots.ts`: `` sitemap: `${SITE_ORIGIN}/sitemap.xml` ``.
5. Добавить `.env.example`:

   ```
   NEXT_PUBLIC_SITE_URL=https://mxsm.me
   ```

**Критерии приёмки:**

- [ ] Grep по `https://mxsm.me` находит только fallback в `site-url.ts` и `.env.example`
- [ ] `npm run build` проходит
- [ ] sitemap.xml и robots.txt используют `SITE_ORIGIN`

---

### TASK-4: CI pipeline — lint + build

**Проблема:** нет автоматических проверок на push/PR.

**Файлы:**

- `.github/workflows/ci.yml` (создать)
- `package.json`
- `eslint.config.mjs`

**Шаги:**

1. Обновить `package.json`:

   ```json
   "lint": "eslint src"
   ```

2. В `eslint.config.mjs` добавить `{ ignores: [".next/**", "src/signal/**"] }`.
3. Создать `.github/workflows/ci.yml`:

   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
         - run: npm ci
         - run: npm run lint
         - run: npm run build
   ```

**Критерии приёмки:**

- [ ] `npm run lint` lintит только `src/`, без `.next`
- [ ] CI workflow валиден (yaml syntax)
- [ ] Локально `npm ci && npm run lint && npm run build` проходит

---

### TASK-5: Unit-тесты для критичного data layer

**Проблема:** нет тестов для RSS-парсера, middleware, locale helpers.

**Файлы:**

- `vitest.config.ts`
- `src/lib/episodes.test.ts`
- `src/i18n/config.test.ts`
- `src/middleware.test.ts`
- `package.json` — `"test": "vitest run"`

**Шаги:**

1. Добавить vitest как dev dependency.
2. **episodes.test.ts:**
   - mock fetch с sample RSS XML (minimal valid feed, 2 items);
   - проверить `parseDuration`, `generateSlug`, `normalizeImageUrl` allowlist;
   - проверить reject untrusted audio URL.
3. **config.test.ts:**
   - `localePath("ru")` → `"/"`, `localePath("en")` → `"/en"`;
   - `localeSignalPath`, `localeAboutPath`;
   - `isLocale` guard.
4. **middleware.test.ts:**
   - `/` → rewrite to `/ru`, header `x-mxsm-locale: ru`;
   - `/en/about` → rewrite `/en/about`, header `en`;
   - `/ru` → redirect to `/`.
5. Удалить мёртвый код `getPodcastListEpisodes` из `podcast-list.ts` (или покрыть тестом, если оставляете).
6. Добавить `npm test` в CI (TASK-4).

**Критерии приёмки:**

- [ ] `npm test` проходит локально
- [ ] CI включает `npm test`
- [ ] Минимум 10 meaningful assertions

---

## 🟡 Средний приоритет

### TASK-6: `resolveLocale()` helper

**Проблема:** boilerplate `params → isLocale → notFound()` в 6+ файлах.

**Файлы:**

- `src/i18n/config.ts` (или `src/i18n/resolve-locale.ts`)
- все `page.tsx`, `layout.tsx`, `opengraph-image.tsx` с locale params

**Шаги:**

1. Добавить:

   ```ts
   import { notFound } from "next/navigation";

   export async function resolveLocale(
     params: Promise<{ locale: string }>,
   ): Promise<Locale> {
     const { locale } = await params;
     if (!isLocale(locale)) notFound();
     return locale;
   }
   ```

2. Заменить во всех route files:

   ```ts
   const locale = await resolveLocale(params);
   ```

3. Убрать лишние `as Locale` casts.

**Критерии приёмки:**

- [ ] Grep `if (!isLocale(raw))` в app routes — 0 результатов (кроме helper)
- [ ] `npm run build` проходит

---

### TASK-7: Extract WebGL utilities

**Проблема:** `compileShader` и fullscreen quad setup дублируются в `DustCanvas.tsx` и `SignalPlateVisual.tsx`.

**Файлы:**

- `src/lib/webgl/create-program.ts` (создать)
- `src/lib/webgl/fullscreen-quad.ts` (создать)
- `src/components/effects/DustCanvas.tsx`
- `src/components/effects/SignalPlateVisual.tsx`

**Шаги:**

1. `create-program.ts`:

   ```ts
   export function compileShader(gl, type, source): WebGLShader
   export function createProgram(gl, vsSource, fsSource): WebGLProgram | null
   ```

2. `fullscreen-quad.ts`:

   ```ts
   export function bindFullscreenQuad(gl, program, attribName = "p"): boolean
   ```

3. Рефакторить оба компонента — использовать shared utils, не менять визуальное поведение.

**Критерии приёмки:**

- [ ] Нет duplicate `compileShader` в components
- [ ] Dust и Signal plate визуально идентичны до/после
- [ ] `npm run build` проходит

---

### TASK-8: DRY time-palette init script

**Проблема:** inline `timePaletteInitScript()` дублирует `STOPS` из `time-palette.ts`.

**Файлы:**

- `src/lib/time-palette.ts`

**Шаги:**

1. Генерировать inline script из `JSON.stringify(STOPS)`:

   ```ts
   export function timePaletteInitScript(): string {
     const stopsJson = JSON.stringify(STOPS);
     return `(function(){var stops=${stopsJson};/* shared lerp logic */})();`;
   }
   ```

2. Добавить unit test: `paletteAt(new Date("2026-05-21T12:00:00"))` возвращает expected `--hot`.

**Критерии приёмки:**

- [ ] `STOPS` определён в одном месте
- [ ] Нет FOUC regression (проверить `--hot` в `<html style>` до hydration)
- [ ] Test покрывает palette sampling

---

### TASK-9: Podcast meta strings → dictionary

**Проблема:** локализованные строки plate 04 захардкожены в `podcast-home.ts`.

**Файлы:**

- `src/i18n/types.ts`
- `src/i18n/dictionaries/ru.ts`
- `src/i18n/dictionaries/en.ts`
- `src/lib/podcast-home.ts`

**Шаги:**

1. Расширить `Dictionary.plates.podcast`:

   ```ts
   metaTemplates: {
     plate: string;       // "04 · SHITBUSTARDS"
     with: string;        // "mike zharchev"
     episodes: string;    // "{count} eps · {season}"
     onAir: string;       // "since {since}"
   }
   footTemplate: string;   // "with m. zharchev, since {since}"
   tickerTemplate: string; // "★ ON AIR · {brand} · S{season} · ..."
   ```

2. В `buildMeta` / `buildTicker` / `buildFoot` — interpolate templates, убрать `if (locale === "ru")`.
3. Перенести строки в `ru.ts` / `en.ts`.

**Критерии приёмки:**

- [ ] `podcast-home.ts` не содержит locale-specific string literals
- [ ] RU/EN home podcast plate отображается корректно
- [ ] Fallback path (RSS error) не сломан

---

### TASK-10: TypeScript surface для `src/signal/**`

**Проблема:** signal runtime вне TS/eslint.

**Файлы:**

- `src/signal/runtime.d.ts` (создать)
- `src/components/signal/SignalExperience.tsx`
- `eslint.config.mjs`

**Шаги (минимальный scope — не полная миграция):**

1. Создать `src/signal/runtime.d.ts`:

   ```ts
   export function boot(): void;
   export function dispose(): void;
   ```

2. В `SignalExperience.tsx` типизировать dynamic import.
3. Добавить JSDoc `@typedef` для structures в audio modules.
4. **Не** мигрировать весь signal на TS в этом таске.

**Зависимость:** TASK-1 (dispose API).

**Критерии приёмки:**

- [ ] `SignalExperience` import typed без `@ts-expect-error`
- [ ] Build проходит

---

### TASK-11: Branded error boundary + metadata factory

**Проблема:** нет `error.tsx`; metadata дублируется между pages.

**Файлы:**

- `src/app/[locale]/(site)/error.tsx` (создать)
- `src/app/global-error.tsx` (создать)
- `src/lib/seo/metadata.ts` (создать)
- `src/app/[locale]/(site)/layout.tsx`
- `src/app/[locale]/signal/page.tsx`
- `src/app/[locale]/(site)/about/page.tsx`

**Шаги:**

1. `buildSiteMetadata({ locale, title, description, canonical, ogDescription?, type? })` — общая factory с `metadataBase: SITE_ORIGIN`, twitter/OG defaults.
2. Рефакторить `generateMetadata` в site/signal/about — использовать factory.
3. `error.tsx` — минимальный dark-themed fallback + link home.
4. `about/page.tsx` — добавить `metadataBase` через factory.

**Зависимость:** TASK-3 (SITE_ORIGIN).

**Критерии приёмки:**

- [ ] Три route metadata используют shared factory
- [ ] Throw в server component показывает branded error
- [ ] `npm run build` проходит
