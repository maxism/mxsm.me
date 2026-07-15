import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  meta: {
    title: "Max Ulianov — teams, systems, sound",
    description:
      "Max Ulianov — CTO at MTS.ai. 15 years building teams and engineering systems: a neobank from zero to ~150 people, payments at OnlyFans, satellite SaaS. SHITBUSTARDS podcast, WebGL and sound experiments.",
    ogDescription: "teams, systems, sound — and side projects when the calendar allows.",
    ogLocale: "en_US",
  },
  masthead: {
    name: "Max Ulianov",
    nameGlitch: "Max Ulianov",
    langSwitch: "language",
    place: "moscow",
  },
  nav: {
    primary: "primary",
    about: "about",
    plates: {
      currently: "now",
      archive: "before",
      podcast: "shitbustards",
      signal: "signal",
      mask: "mask",
      contact: "write",
    },
  },
  plates: {
    identity: {
      bio: "i build teams and systems from zero — and untangle the ones that grew faster than their agreements.",
      bioEm: "cto at mts.ai. before that — a ~150-person bank, payments at onlyfans, satellite saas. sound and pixels when the calendar allows.",
      aboutLink: "about ↗",
    },
    currently: {
      heading: "/ now",
      headingGlitch: "// now",
      nowPlaying: {
        label: "now playing",
        silence: "silence",
        lastPlayed: "last played",
        recent: "recently",
        loading: "checking last.fm…",
        unavailable: "last.fm is temporarily unavailable",
        profile: "maxismart on last.fm ↗",
      },
      roles: [
        {
          n: "01",
          name: "MTS.ai",
          href: "https://mts.ai/",
          prose: "cto since dec 2025 — neural search, moscow. most of it under nda.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "co-founder since 2025 — the team behind untitled bank, kept together and growing toward the next big project",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ before",
      headingGlitch: "// before",
      teaser: "2010 → 2025 · 7 stops · 5 countries — banking, adult, space, iot, gov",
      aboutLink: "full path on about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "untitled bank",
          href: "https://untitlednow.com/",
          line: "co-ceo & cto · built to ~150 people, in-house emv/3ds/hsm · regulator pulled the licence pre-launch · uz",
        },
        {
          years: "2022 — 23",
          name: "onlyfans",
          line: "head of engineering · payments, creator tools, dora · uk",
        },
        {
          years: "2021 — 23",
          name: "precious payload",
          href: "https://www.linkedin.com/company/preciouspayload",
          line: "co-founder & cto · satellite mission saas · uae",
        },
        {
          years: "2020 — 21",
          name: "palebluedot",
          line: "cto · fabble, onespace, codewards · uae",
        },
        {
          years: "2017 — 18",
          name: "moeco",
          href: "https://moeco.io/",
          line: "tech lead → co-cto · iot for supply chains · de",
        },
        {
          years: "2015 — 20",
          name: "rentateam",
          href: "https://www.rentateam.ru/",
          line: "co-founder & cto · studio: dodo, vw, vcv, timepad · ru",
        },
        {
          years: "2010 — 15",
          name: "ministry of digital",
          line: "full-stack → team lead · internal systems · ru",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · SHITBUSTARDS",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} eps · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "life & people, no tech talk · with m. zharchev, since {since}",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "SHITBUSTARDS",
      headingGlitch: "SHITBUSTARDS",
      ticker: "★ ON AIR · SHITBUSTARDS · LIFE · PEOPLE · S2 · ",
      tickerBrand: "SHITBUSTARDS",
      onAir: "ON AIR",
      foot: "life & people, no tech talk · with m. zharchev, since mar 2024",
    },
    signal: {
      meta: [
        { key: "TYPE", value: "brain dump" },
        { key: "STACK", value: "webgl · web audio" },
      ],
      heading: "/ signal",
      headingGlitch: "// signal",
      quote: ["spilled from my head", "no thesis", "no explanation."],
      metaRows: [
        { key: "stack", value: "webgl · web audio · tts" },
        { key: "origin", value: "spilled from my head" },
        { key: "session", value: "unique each visit" },
      ],
      cta: "enter signal ↗",
      ctaHint: "fullscreen · sound on · click or move to wake",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "inner world" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "drag to rotate · click to flip",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ write",
      headingGlitch: "// write",
      hint: "mentoring, architecture reviews, engineering cost audits — all good reasons to write. i read everything and reply myself, so it can take a week.",
    },
  },
  maskPage: {
    title: "mxsm / mask",
    description: "my inner world — pin art on one side, refracting glass on the other",
    exitLabel: "← mxsm",
    materialsTagline: "glass · dispersion · holographic · glitch · ghost · blood · x-ray · rot · void",
    scanFace: "scan face",
    uploadObj: "upload .obj",
    objTooLarge: "file too large (max 5 MB)",
    materials: {
      dispersion: "dispersion",
      holo: "holographic",
      glitch: "glitch",
      ghost: "ghost",
      glass: "glass",
      blood: "blood",
      xray: "x-ray",
      rot: "rot",
      void: "void",
    },
    loader: {
      initializing: "initializing scene…",
      loadingModel: "loading mask model…",
    },
    scanner: {
      loading: "loading mediapipe…",
      aimFace: "point the camera at your face",
      faceFound: "face detected",
      cameraDenied: "camera access denied — check browser settings",
      cancel: "✕ cancel",
      capture: "● capture",
    },
    seo: {
      title: "mxsm / mask",
      paragraphs: [
        "mxsm/mask — my inner world, rendered as a face in the browser. pin art on one side, glass on the other.",
        "pick a material, scan your face with the webcam, or drop an OBJ. three.js, no install.",
        "max ulianov, 2026.",
      ],
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "spilled from my head — fullscreen, sound, text, a tunnel. no buttons.",
    ogDescription: "spilled from my head — no thesis, no explanation",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal — something that spilled out of my head. no thesis behind it. fullscreen in the browser: sound on, text streams, a tunnel.",
        "webgl plus web audio. click or move to wake it — each session runs differently.",
        "max ulianov, 2025–2026.",
      ],
    },
  },
  footer: {
    lines: [
      "made between meetings · moscow utc+3",
      "sometimes listening, sometimes building",
    ],
    home: "home",
    about: "about",
  },
};
