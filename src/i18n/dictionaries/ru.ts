import type { Dictionary } from "@/i18n/types";

export const ru: Dictionary = {
  meta: {
    title: "Макс Ульянов — CTO в MTS.ai",
    description:
      "Макс Ульянов, CTO в MTS.ai. Москва. Раньше собирал необанк, занимался платежами в OnlyFans и спутниковым SaaS. Ведёт подкаст «Шитбастардс».",
    ogDescription: "CTO в MTS.ai, Москва.",
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
      bio: "CTO в MTS.ai. Живу в Москве.",
      bioEm: "До этого собирал банк примерно на 150 человек, платежи в OnlyFans и спутниковый SaaS.",
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
          prose: "CTO с декабря 2025, нейропоиск, Москва. Подробности под NDA.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "Сооснователь с 2025. Команда из Untitled Bank, после закрытия банка остались вместе.",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ было",
      headingGlitch: "// было",
      teaser: "С 2010 года. Семь мест, пять стран.",
      aboutLink: "подробнее на about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "untitled bank",
          href: "https://untitlednow.com/",
          line: "Co-CEO и CTO. Команда примерно до 150 человек, свои EMV, 3DS и HSM. Лицензию отозвали до запуска. Узбекистан.",
        },
        {
          years: "2022 — 23",
          name: "onlyfans",
          line: "Head of Engineering. Платежи, инструменты для авторов, DORA. Великобритания.",
        },
        {
          years: "2021 — 23",
          name: "precious payload",
          href: "https://www.linkedin.com/company/preciouspayload",
          line: "Сооснователь и CTO. SaaS для спутниковых миссий. ОАЭ.",
        },
        {
          years: "2020 — 21",
          name: "palebluedot",
          line: "CTO. Fabble, OneSpace, Codewards. ОАЭ.",
        },
        {
          years: "2017 — 18",
          name: "moeco",
          href: "https://moeco.io/",
          line: "Tech lead, потом co-CTO. IoT для логистики. Германия.",
        },
        {
          years: "2015 — 20",
          name: "rentateam",
          href: "https://www.rentateam.ru/",
          line: "Сооснователь и CTO. Студия: Dodo, Volkswagen, VCV, Timepad. Россия.",
        },
        {
          years: "2010 — 15",
          name: "минцифры",
          line: "От разработчика до тимлида. Внутренние системы. Россия.",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · ШИТБАСТАРДС",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} эп. · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "Про жизнь и людей, без рабочих тем. С Майком Жарчевым, с {since}.",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "ШИТБАСТАРДС",
      headingGlitch: "ШИТБАСТАРДС",
      ticker: "★ ON AIR · ШИТБАСТАРДС · ЖИЗНЬ · ЛЮДИ · S2 · ",
      tickerBrand: "ШИТБАСТАРДС",
      onAir: "ON AIR",
      foot: "Про жизнь и людей, без рабочих тем. С Майком Жарчевым, с марта 2024.",
    },
    signal: {
      meta: [
        { key: "TYPE", value: "звук и текст" },
        { key: "STACK", value: "webgl · web audio" },
      ],
      heading: "/ signal",
      headingGlitch: "// signal",
      quote: ["Звук", "Текст", "WebGL"],
      metaRows: [
        { key: "stack", value: "WebGL, Web Audio, синтез речи" },
        { key: "origin", value: "с главной" },
        { key: "session", value: "каждый заход отличается" },
      ],
      cta: "открыть signal ↗",
      ctaHint: "Полный экран, со звуком. Клик или движение, чтобы начать.",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "pin art · glass" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "Можно тянуть, крутить и нажать, чтобы перевернуть.",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ написать",
      headingGlitch: "// написать",
      hint: "Могу поговорить про менторство, разбор архитектуры и расходы на разработку. Письма читаю сам. Ответ иногда занимает больше недели.",
    },
  },
  maskPage: {
    title: "mxsm / mask",
    description: "Маска в браузере: с одной стороны пин-арт, с другой стекло.",
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
        "mxsm/mask — маска в браузере. С одной стороны пин-арт, с другой стекло.",
        "Можно выбрать материал, отсканировать лицо камерой или загрузить OBJ. Сделано на Three.js, ничего ставить не нужно.",
        "Макс Ульянов, 2026.",
      ],
    },
  },
  signalPage: {
    title: "mxsm / signal",
    description: "Полный экран: звук, текст и тоннель. WebGL и Web Audio.",
    ogDescription: "Звук, текст и тоннель на весь экран.",
    seo: {
      title: "mxsm / signal",
      paragraphs: [
        "mxsm/signal — полный экран в браузере: звук, текст и тоннель.",
        "WebGL и Web Audio. Чтобы начать, кликните или поводите курсором. Каждый заход отличается.",
        "Макс Ульянов, 2025–2026.",
      ],
    },
  },
  footer: {
    lines: [
      "Москва, UTC+3",
      "m@mxsm.me",
    ],
    home: "главная",
    about: "about",
  },
};
