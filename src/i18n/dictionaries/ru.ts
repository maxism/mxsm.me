import type { Dictionary } from "@/i18n/types";

export const ru: Dictionary = {
  meta: {
    title: "Макс Ульянов — CTO MTS.ai, co-founder Untitled Team",
    description:
      "Макс Ульянов (Max Ulianov). CTO в MTS.ai, со-основатель Untitled Team. Подкаст Шитбастардс. Арт-объект mxsm/signal. Москва, 2026.",
    ogDescription:
      "чертёж одного человека: макс ульянов, cto mts.ai, untitled team, подкаст шитбастардс, mxsm/signal.",
    ogLocale: "ru_RU",
  },
  masthead: {
    langSwitch: "language",
  },
  nav: {
    primary: "primary",
    about: "about",
  },
  plates: {
    identity: {
      meta: [
        { key: "PLATE", value: "01 · IDENTITY" },
        { key: "ISSUED", value: "may 2026" },
        { key: "DRAWN BY", value: "maxism" },
      ],
      bio: "строит команды и инженерные системы с нуля.",
      bioEm: "иногда отвлекается на звук и форму.",
      tags: ["cto", "mts.ai", "untitled team", "est. moscow"],
      ghostGlyph: "У",
    },
    currently: {
      meta: [
        { key: "PLATE", value: "02 · CURRENTLY" },
        { key: "ROLES", value: "02, both live" },
        { key: "BOTH SINCE", value: "2025" },
      ],
      heading: "/\u2009сейчас",
      headingGlitch: "// сейчас",
      live: "● LIVE",
      roles: [
        {
          n: "01",
          name: "MTS.ai",
          href: "https://mts.ai/",
          kv: [
            { key: "role", value: "cto" },
            { key: "since", value: "dec 2025" },
            { key: "building", value: "generative neural search" },
            { key: "loc", value: "moscow" },
          ],
        },
        {
          n: "02",
          name: "Untitled Team",
          kv: [
            { key: "role", value: "co-founder" },
            { key: "since", value: "2025" },
            { key: "with", value: "m. zharchev · a. kharchenko" },
            {
              key: "link",
              value: "untitlednow.com ↗",
              href: "https://untitlednow.com/",
            },
          ],
        },
      ],
    },
    archive: {
      meta: [
        { key: "PLATE", value: "03 · ARCHIVE" },
        { key: "WINDOW", value: "2010 → 2025" },
        { key: "STOPS", value: "07 / 5 countries" },
        { key: "LANES", value: "banking · adult · space · iot · gov" },
      ],
      heading: "/\u2009архив",
      headingGlitch: "// архив",
      items: [
        {
          n: "A1",
          years: "2023 — 25",
          name: "Untitled Bank",
          tag: "co-ceo & cto · uz",
          note: "~100 · in-house emv/3ds/hsm · licence pulled",
        },
        {
          n: "A2",
          years: "2022 — 23",
          name: "OnlyFans",
          tag: "head of engineering · uk",
          note: "payments · creator tools · dora · ladders",
        },
        {
          n: "A3",
          years: "2021 — 23",
          name: "Precious Payload",
          tag: "co-founder & cto · uae",
          note: "satellite mission saas · launch.ctrl",
        },
        {
          n: "A4",
          years: "2020 — 21",
          name: "PALEBLUEDOT",
          tag: "cto · uae",
          note: "fabble · onespace · codewards · easy habit",
        },
        {
          n: "A5",
          years: "2017 — 18",
          name: "Moeco",
          tag: "co-cto · de",
          note: "iot · cargo telemetry platform",
        },
        {
          n: "A6",
          years: "2015 — 20",
          name: "RentaTeam",
          tag: "co-founder & cto · ru",
          note: "dodo pizza · vw rus · vcv · timepad",
        },
        {
          n: "A7",
          years: "2010 — 15",
          name: "Минцифры РФ",
          tag: "team lead · ru",
          note: "internal systems · federal infra",
        },
      ],
    },
    podcast: {
      metaFallback: [
        { key: "PLATE", value: "04 · ШИТБАСТАРДС" },
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "/\u2009шитбастардс",
      headingGlitch: "// шитбастардс",
      ticker: "★ ON AIR · ШИТБАСТАРДС · S2 · WITH MIKE ZHARCHEV ·\u00a0",
      tickerBrand: "ШИТБАСТАРДС",
      onAir: "ON AIR",
      foot: "с m. zharchev, с марта 2024",
      ghostGlyph: "Ш",
    },
    signal: {
      meta: [
        { key: "PLATE", value: "05 · MXSM/SIGNAL" },
        { key: "TYPE", value: "generative art" },
        { key: "STACK", value: "webgl · web audio" },
      ],
      heading: "/\u2009signal",
      headingGlitch: "// signal",
      quote: [
        "сигнал пришёл",
        "из того места,",
        "куда не отправляли.",
      ],
      metaRows: [
        { key: "stack", value: "webgl · web audio · formant synthesis" },
        { key: "voices", value: "03" },
        { key: "depth", value: "i. void · ii. pattern · iii. voice" },
      ],
      cta: "войти в signal ↗",
      ctaHint: "полный экран · звук · клик или движение",
      exitLabel: "← mxsm",
    },
    contact: {
      meta: [
        { key: "PLATE", value: "06 · CONTACT" },
        { key: "ANSWERS", value: "within a week" },
      ],
      heading: "/\u2009сигнал",
      headingGlitch: "// сигнал",
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "сигнал пришёл из того места, куда не отправляли",
    ogDescription: "сигнал пришёл из того места, куда не отправляли",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal — генеративный аудио-визуальный арт-объект Макса Ульянова на mxsm.me. это не сайт в привычном смысле: три сущности говорят одновременно через одну систему, и ни одна не знает про остальных.",
        "три голоса: бездна — древнее нечеловеческое присутствие; система на пороге — слабый ИИ, который перестаёт имитировать и начинает понимать; Макс Ульянов — живой тёплый сигнал, единственное человеческое в этом пространстве.",
        "Web Audio API и WebGL, без UI: синтезированные дроны, речь по тексту в реальном времени, глитч-типографика, визуальный тоннель. каждый визит уникален; параметр seed фиксирует сессию. автор — Max Ulianov, 2025–2026.",
      ],
    },
  },
  footer: {
    copyright: "© 2026 Max Ulianov",
    home: "главная",
    about: "about",
  },
};
