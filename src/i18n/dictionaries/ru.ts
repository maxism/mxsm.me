import type { Dictionary } from "@/i18n/types";

export const ru: Dictionary = {
  meta: {
    title: "Max Ulianov — CTO @ MTS.ai, co-founder Untitled Team",
    description:
      "Макс Ульянов. CTO в MTS.ai, со-основатель Untitled Team. Подкаст Шитбастардс. Арт-объект mxsm/signal. Москва, 2026.",
    ogDescription:
      "чертёж одного человека: cto mts.ai, untitled team, подкаст шитбастардс, mxsm/signal.",
    ogLocale: "ru_RU",
  },
  masthead: {
    langSwitch: "language",
  },
  nav: {
    primary: "primary",
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
      meta: [
        { key: "PLATE", value: "04 · ШИТБАСТАРДС" },
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "/\u2009шитбастардс",
      headingGlitch: "// шитбастардс",
      ticker: "★ ON AIR · ШИТБАСТАРДС · S2 · WITH MIKE ZHARCHEV ·\u00a0",
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
  },
  footer: {
    copyright: "© 2026 Max Ulianov",
  },
};
