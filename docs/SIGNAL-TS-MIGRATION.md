# Signal → TypeScript (эпик)

> Приоритет: **выше** backlog TASK-1…11 (polish).  
> Объём: ~2.6k LOC JS в `src/signal/`.

## Зачем

- Сейчас: strict TS на сайте, signal — JS + тонкий `runtime.d.ts` (нет типов внутри runtime).
- Цель: один язык, lint на signal, безопасные контракты между audio / text / visual / main.
- `SignalPlateVisual` уже на TS — palette из `time-palette.ts`; signal runtime остаётся отдельным «островом».

## Порядок миграции (снизу вверх)

| Фаза | Модули | LOC ≈ | Статус |
|------|--------|-------|--------|
| **0** | `types.ts`, tooling, eslint | — | ✅ |
| **1** | `phrases.ts`, `audio/helpers.ts` | 170 | ✅ |
| **2** | `text-layer.ts` | 603 | ⬜ |
| **3** | `audio/index.ts` | 589 | ⬜ |
| **4** | `visual-unstable.ts` | 737 | ⬜ (WebGL2, FBO, шейдеры) |
| **5** | `main.ts` | 461 | ⬜ |
| **6** | Cleanup | — | ⬜ |

## Правила

1. **Один PR / волна = одна фаза** — проще ревью и откат.
2. Импорты без `.js` суффикса: `./phrases`, `@/signal/main`.
3. `SignalExperience`: `import("@/signal/main")` после фазы 5.
4. Убрать `src/signal/**` из `eslint ignores` по мере готовности фазы.
5. **Поведение 1:1** — без рефакторинга логики в той же фазе (только типы + мелкие guard).
6. Smoke: `/signal` boot → dispose → повторный заход; home plate 05; `?seed=42`.

## Типы (`types.ts`)

- `PhraseRegister`: `abyss` | `threshold` | `max` | `other`
- `MeaningEvent`: phrase, intensity, biasX, biasY
- `AudioUpdateParams`, `VisualDrawParams`, `SceneName`
- `SignalRuntime`: `{ boot, dispose }`

## Риски

| Риск | Митигация |
|------|-----------|
| WebGL2 typings | `WebGL2RenderingContext`, локальные narrow для extensions |
| `random` callback type | `() => number` везде одинаково |
| Bundle size | TS не меняет runtime; tree-shake как сейчас |
| Strict null | Явные early return как в JS |

## Definition of Done (эпик)

- [ ] Нет `.js` в `src/signal/` (кроме возможного re-export shim — не планируется)
- [ ] `runtime.d.ts` удалён — типы из `main.ts`
- [ ] `eslint` включает `src/signal/**/*.ts`
- [ ] `npm run build` + ручной smoke signal
- [ ] README signal обновлён

## Не в scope эпика

- Переписывание шейдеров / сцен
- Объединение с `SignalPlateVisual` (разные WebGL1 vs WebGL2)
- E2E Playwright
