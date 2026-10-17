import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  meta: {
    title: "Max Ulianov — CTO at MTS.ai",
    description:
      "Max Ulianov, CTO at MTS.ai. Moscow. Previously built a neobank, worked on payments at OnlyFans, and built satellite SaaS. Co-hosts the Shitbustards podcast.",
    ogDescription: "CTO at MTS.ai, Moscow.",
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
      bio: "CTO at MTS.ai. I live in Moscow.",
      bioEm: "Before that I built a bank of about 150 people, payments at OnlyFans, and satellite SaaS.",
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
          prose: "CTO since December 2025, neural search, Moscow. Details are under NDA.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "Co-founder since 2025. The Untitled Bank team, still together after the bank closed.",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ before",
      headingGlitch: "// before",
      teaser: "Since 2010. Seven places, five countries.",
      aboutLink: "more on about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "untitled bank",
          href: "https://untitlednow.com/",
          line: "Co-CEO and CTO. A team of about 150, in-house EMV, 3DS and HSM. The licence was pulled before launch. Uzbekistan.",
        },
        {
          years: "2022 — 23",
          name: "onlyfans",
          line: "Head of Engineering. Payments, creator tools, DORA. United Kingdom.",
        },
        {
          years: "2021 — 23",
          name: "precious payload",
          href: "https://www.linkedin.com/company/preciouspayload",
          line: "Co-founder and CTO. SaaS for satellite missions. UAE.",
        },
        {
          years: "2020 — 21",
          name: "palebluedot",
          line: "CTO. Fabble, OneSpace, Codewards. UAE.",
        },
        {
          years: "2017 — 18",
          name: "moeco",
          href: "https://moeco.io/",
          line: "Tech lead, then co-CTO. IoT for logistics. Germany.",
        },
        {
          years: "2015 — 20",
          name: "rentateam",
          href: "https://www.rentateam.ru/",
          line: "Co-founder and CTO. Studio work: Dodo, Volkswagen, VCV, Timepad. Russia.",
        },
        {
          years: "2010 — 15",
          name: "ministry of digital",
          line: "From full-stack developer to team lead. Internal systems. Russia.",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · SHITBUSTARDS",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} eps · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "About life and people, not about work. With Mike Zharchev, since {since}.",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "SHITBUSTARDS",
      headingGlitch: "SHITBUSTARDS",
      ticker: "★ ON AIR · SHITBUSTARDS · LIFE · PEOPLE · S2 · ",
      tickerBrand: "SHITBUSTARDS",
      onAir: "ON AIR",
      foot: "About life and people, not about work. With Mike Zharchev, since March 2024.",
    },
    signal: {
      meta: [
        { key: "TYPE", value: "sound and text" },
        { key: "STACK", value: "webgl · web audio" },
      ],
      heading: "/ signal",
      headingGlitch: "// signal",
      quote: ["Sound", "Text", "WebGL"],
      metaRows: [
        { key: "stack", value: "WebGL, Web Audio, speech synthesis" },
        { key: "origin", value: "from the home page" },
        { key: "session", value: "different each visit" },
      ],
      cta: "open signal ↗",
      ctaHint: "Fullscreen, with sound. Click or move to start.",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "pin art · glass" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "Drag to turn it, click to flip it.",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ write",
      headingGlitch: "// write",
      hint: "I can talk about mentoring, an architecture review, or engineering costs. I read the mail myself. A reply can take more than a week.",
    },
  },
  maskPage: {
    title: "mxsm / mask",
    description: "A mask in the browser: pin art on one side, glass on the other.",
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
        "mxsm/mask is a mask in the browser. Pin art on one side, glass on the other.",
        "Pick a material, scan a face with the camera, or upload an OBJ. Built with Three.js, nothing to install.",
        "Max Ulianov, 2026.",
      ],
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "Fullscreen: sound, text, and a tunnel. WebGL and Web Audio.",
    ogDescription: "Sound, text, and a tunnel, fullscreen.",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal is fullscreen in the browser: sound, text, and a tunnel.",
        "WebGL and Web Audio. Click or move the cursor to start. Each visit is different.",
        "Max Ulianov, 2025–2026.",
      ],
    },
  },
  footer: {
    lines: [
      "Moscow, UTC+3",
      "m@mxsm.me",
    ],
    home: "home",
    about: "about",
  },
};
