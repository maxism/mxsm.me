import type { Dictionary } from "@/i18n/types";

export const ru: Dictionary = {
  meta: {
    title: "Макс Ульянов — команды, системы, звук",
    description:
      "Макс Ульянов — CTO MTS.ai. 15 лет собирает команды и инженерные системы: необанк с нуля до ~150 человек, платежи OnlyFans, космический SaaS. Подкаст Шитбастардс, эксперименты с WebGL и звуком.",
    ogDescription: "команды, системы, звук — и side projects, когда календарь позволяет.",
    ogLocale: "ru_RU",
  },
  masthead: {
    name: "Макс Ульянов",
    nameGlitch: "Макс Ульянов",
    langSwitch: "language",
    place: "москва",
  },
  nav: {
    primary: "primary",
    about: "about",
    plates: {
      currently: "сейчас",
      archive: "было",
      podcast: "шитбастардс",
      signal: "signal",
      mask: "mask",
      contact: "написать",
    },
  },
  plates: {
    identity: {
      bio: "собираю команды и системы с нуля — и распутываю те, что выросли быстрее договорённостей.",
      bioEm: "cto mts.ai. до этого — банк на ~150 человек, платежи onlyfans, спутниковый saas. звук и пиксели, когда календарь отпускает.",
      aboutLink: "about ↗",
    },
    currently: {
      heading: "/ сейчас",
      headingGlitch: "// сейчас",
      nowPlaying: {
        label: "слушаю",
        silence: "тишина",
        lastPlayed: "последний трек",
        recent: "недавно",
        loading: "смотрю last.fm…",
        unavailable: "last.fm временно недоступен",
        profile: "maxismart на last.fm ↗",
      },
      roles: [
        {
          n: "01",
          name: "MTS.ai",
          href: "https://mts.ai/",
          prose: "cto с декабря 2025 — нейропоиск, москва. большая часть под nda.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "сооснователь с 2025 — команда, собранная в untitled bank: сохранили и растим до следующего большого проекта",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ было",
      headingGlitch: "// было",
      teaser: "2010 → 2025 · 7 остановок · 5 стран — banking, adult, space, iot, gov",
      aboutLink: "полный путь на about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "untitled bank",
          href: "https://untitlednow.com/",
          line: "co-ceo & cto · собрали до ~150 человек, свой emv/3ds/hsm · регулятор отозвал лицензию до запуска · uz",
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
          line: "tech lead → co-cto · iot для логистики · de",
        },
        {
          years: "2015 — 20",
          name: "rentateam",
          href: "https://www.rentateam.ru/",
          line: "co-founder & cto · студия: dodo, vw, vcv, timepad · ru",
        },
        {
          years: "2010 — 15",
          name: "минцифры",
          line: "fullstack → team lead · внутренние системы · ru",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · ШИТБАСТАРДС",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} эп. · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "про жизнь и людей — без айти · с m. zharchev, с {since}",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "ШИТБАСТАРДС",
      headingGlitch: "ШИТБАСТАРДС",
      ticker: "★ ON AIR · ШИТБАСТАРДС · ЖИЗНЬ · ЛЮДИ · S2 · ",
      tickerBrand: "ШИТБАСТАРДС",
      onAir: "ON AIR",
      foot: "про жизнь и людей — без айти · с m. zharchev, с марта 2024",
    },
    signal: {
      meta: [
        { key: "TYPE", value: "brain dump" },
        { key: "STACK", value: "webgl · web audio" },
      ],
      heading: "/ signal",
      headingGlitch: "// signal",
      quote: ["сорвалось из головы", "без замысла", "без объяснений."],
      metaRows: [
        { key: "stack", value: "webgl · web audio · tts" },
        { key: "origin", value: "сорвалось из головы" },
        { key: "session", value: "каждый визит свой" },
      ],
      cta: "войти в signal ↗",
      ctaHint: "полный экран · звук · клик или движение",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "inner world" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "тяни · крути · клик для разворота",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ написать",
      headingGlitch: "// написать",
      hint: "менторство, architecture review, аудит инженерных расходов — хорошие поводы написать. читаю всё и отвечаю сам, поэтому иногда до недели.",
    },
  },
  maskPage: {
    title: "mxsm / mask",
    description: "мой внутренний мир — пин-арт с одной стороны, стекло с другой",
    exitLabel: "← mxsm",
    materialsTagline: "glass · dispersion · holographic · glitch · ghost · blood · x-ray · rot · void",
    scanFace: "скан лица",
    uploadObj: "загрузить .obj",
    objTooLarge: "файл слишком большой (макс. 5 МБ)",
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
      initializing: "инициализация сцены…",
      loadingModel: "загрузка модели маски…",
    },
    scanner: {
      loading: "загрузка mediapipe…",
      aimFace: "наведи камеру на лицо",
      faceFound: "лицо обнаружено",
      cameraDenied: "нет доступа к камере — проверь настройки браузера",
      cancel: "✕ отмена",
      capture: "● capture",
    },
    seo: {
      title: "mxsm / mask",
      paragraphs: [
        "mxsm/mask — мой внутренний мир, свёрнутый в лицо в браузере. пин-арт с одной стороны, стекло с другой.",
        "выбери материал, отсканируй лицо через камеру или загрузи OBJ. three.js, без установки.",
        "макс ульянов, 2026.",
      ],
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "сорвалось из головы — fullscreen, звук, текст, тоннель. без кнопок.",
    ogDescription: "сорвалось из головы — без замысла и объяснений",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal — сорвалось из головы. без замысла. fullscreen в браузере: звук, текстовые потоки, тоннель.",
        "webgl и web audio. клик или движение — чтобы разбудить. каждый заход отличается.",
        "макс ульянов, 2025–2026.",
      ],
    },
  },
  footer: {
    lines: [
      "между встречами · москва utc+3",
      "иногда слушаю, иногда строю",
    ],
    home: "главная",
    about: "about",
  },
};
