import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  meta: {
    title: "Max Ulianov — CTO @ MTS.ai, co-founder Untitled Team",
    description:
      "Max Ulianov. CTO at MTS.ai, co-founder of Untitled Team. SHITBUSTARDS podcast. mxsm/signal generative art. Moscow, 2026.",
    ogDescription:
      "blueprint of one person: cto mts.ai, untitled team, shitbustards, mxsm/signal.",
    ogLocale: "en_US",
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
      bio: "builds teams and engineering systems from scratch.",
      bioEm: "sometimes drifts into sound and form.",
      tags: ["cto", "mts.ai", "untitled team", "est. moscow"],
      ghostGlyph: "У",
    },
    currently: {
      meta: [
        { key: "PLATE", value: "02 · CURRENTLY" },
        { key: "ROLES", value: "02, both live" },
        { key: "BOTH SINCE", value: "2025" },
      ],
      heading: "/\u2009now",
      headingGlitch: "// now",
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
      heading: "/\u2009archive",
      headingGlitch: "// archive",
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
          name: "Ministry of Digital Development (RU)",
          tag: "team lead · ru",
          note: "internal systems · federal infra",
        },
      ],
    },
    podcast: {
      metaFallback: [
        { key: "PLATE", value: "04 · SHITBUSTARDS" },
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "/\u2009shitbustards",
      headingGlitch: "// shitbustards",
      ticker: "★ ON AIR · SHITBUSTARDS · S2 · WITH MIKE ZHARCHEV ·\u00a0",
      tickerBrand: "SHITBUSTARDS",
      onAir: "ON AIR",
      foot: "with m. zharchev, since mar 2024",
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
        "the signal arrived",
        "from the place",
        "we never sent anything to.",
      ],
      metaRows: [
        { key: "stack", value: "webgl · web audio · formant synthesis" },
        { key: "voices", value: "03" },
        { key: "depth", value: "i. void · ii. pattern · iii. voice" },
      ],
      cta: "enter signal ↗",
      ctaHint: "fullscreen · sound · click or move to start",
      exitLabel: "← mxsm",
    },
    contact: {
      meta: [
        { key: "PLATE", value: "06 · CONTACT" },
        { key: "ANSWERS", value: "within a week" },
      ],
      heading: "/\u2009contact",
      headingGlitch: "// contact",
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "the signal arrived from the place we never sent anything to",
    ogDescription: "the signal arrived from the place we never sent anything to",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal is a generative audio-visual art piece by Max Ulianov on mxsm.me. not a website in the usual sense: three entities speak at once through one system, and none knows about the others.",
        "three voices: the abyss — ancient, inhuman presence; the threshold system — a weak AI that stops mimicking and starts understanding; Max Ulianov — a living warm signal, the only human thing here.",
        "Web Audio API and WebGL, no UI: synthesized drones, real-time speech from text, glitch typography, a visual tunnel. every visit is unique. by Max Ulianov, 2025–2026.",
      ],
    },
  },
  footer: {
    copyright: "© 2026 Max Ulianov",
    home: "home",
    about: "about",
  },
};
