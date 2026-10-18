import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  meta: {
    title: "Max Ulianov — CTO at MWS AI",
    description:
      "Max Ulianov is CTO at MWS AI (formerly MTS AI) and CTPO of its AI Agents Platform, based in Moscow. Before that: a neobank, payments at OnlyFans, satellite SaaS. Co-hosts the Shitbustards podcast.",
    ogDescription: "CTO at MWS AI and CTPO of its AI Agents Platform. Moscow.",
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
      bio: "CTO at MWS AI and CTPO of its AI Agents Platform. Based in Moscow.",
      bioEm: "Before that: payments at OnlyFans, satellite SaaS, and a 150-person bank that closed before it opened.",
      aboutLink: "about ↗",
    },
    currently: {
      heading: "/ now",
      headingGlitch: "// now",
      roles: [
        {
          n: "01",
          name: "MWS AI",
          href: "https://mts.ai/",
          prose: "CTO since December 2025, working on neural search. Formerly MTS AI, part of the MTS group: Cotype models, speech services, AI Agents Platform. For the platform I'm CTPO, so both technology and product. Details under NDA.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "Co-founder since 2025. The bank closed, the Untitled Bank team stayed together and is growing toward the next big project.",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ before",
      headingGlitch: "// before",
      teaser: "Fifteen years, seven places, five countries: banking, adult, space, IoT, government.",
      aboutLink: "more on about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "Untitled Bank",
          href: "https://untitlednow.com/",
          line: "Co-CEO and CTO. The team grew to 150. Our own core banking, plus EMV, 3DS and HSM. The licence was pulled before launch. Uzbekistan.",
        },
        {
          years: "2022 — 23",
          name: "OnlyFans",
          line: "Head of Engineering. Payments and creator tools. United Kingdom.",
        },
        {
          years: "2021 — 23",
          name: "Precious Payload",
          href: "https://www.linkedin.com/company/preciouspayload",
          line: "Co-founder and CTO. SaaS for satellite missions. UAE.",
        },
        {
          years: "2020 — 21",
          name: "Palebluedot",
          line: "CTO. Mobile apps and habit trackers, among them Fabble, OneSpace, Codewards. UAE.",
        },
        {
          years: "2017 — 18",
          name: "Moeco",
          href: "https://moeco.io/",
          line: "Tech lead, then co-CTO. A blockchain network for IoT, a $5M round from Bitfury in 2017. Germany.",
        },
        {
          years: "2015 — 20",
          name: "RentaTeam",
          href: "https://www.rentateam.ru/",
          line: "Co-founder and CTO. A mobile and web studio: Dodo, Volkswagen, VCV, Timepad. Russia.",
        },
        {
          years: "2010 — 15",
          name: "Ministry of Digital Development",
          line: "From full-stack developer to team lead. Internal systems. Russia.",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · SHITBUSTARDS",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} eps · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "An uncivilised conversational podcast about life, tech, music and everything else. Two hosts, zero script. With Mike Zharchev since {since}.",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "SHITBUSTARDS",
      headingGlitch: "SHITBUSTARDS",
      ticker: "★ ON AIR · SHITBUSTARDS · LIFE · PEOPLE · S2 · ",
      tickerBrand: "SHITBUSTARDS",
      onAir: "ON AIR",
      foot: "An uncivilised conversational podcast about life, tech, music and everything else. Two hosts, zero script. With Mike Zharchev since March 2024.",
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
      ctaHint: "Fullscreen, with sound. It starts on a click or a mouse move.",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "pin art · glass" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "Drag to rotate, click to flip: pin art on one side, glass on the other.",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ write",
      headingGlitch: "// write",
      hint: "Write to me about mentoring, an architecture review, or an audit of engineering costs. I read every email myself, so a reply can take over a week.",
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
      skull: "skull",
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
