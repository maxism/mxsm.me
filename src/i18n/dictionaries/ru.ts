import type { Dictionary } from "@/i18n/types";

export const ru: Dictionary = {
  meta: {
    title: "Макс Ульянов — CTO в MWS AI",
    description:
      "Макс Ульянов — CTO в MWS AI (бывшая MTS AI) и CTPO её платформы для ИИ-агентов, Москва. Раньше: необанк, платежи в OnlyFans, SaaS для спутников. Ведёт подкаст «Шитбастардс».",
    ogDescription: "CTO в MWS AI и CTPO её платформы для ИИ-агентов. Москва.",
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
      bio: "CTO в MWS AI и CTPO её платформы для ИИ-агентов. Живу в Москве.",
      bioEm: "Раньше: платежи в OnlyFans, SaaS для спутников и банк на 150 человек, который закрылся до открытия.",
      aboutLink: "about ↗",
    },
    currently: {
      heading: "/ сейчас",
      headingGlitch: "// сейчас",
      roles: [
        {
          n: "01",
          name: "MWS AI",
          href: "https://mts.ai/",
          prose: "CTO с декабря 2025, нейропоиск. Бывшая MTS AI, в группе МТС: модели Cotype, речевые сервисы, AI Agents Platform. За платформу отвечаю как CTPO — и за технологии, и за продукт. Детали под NDA.",
        },
        {
          n: "02",
          name: "Untitled Team",
          prose: "Сооснователь с 2025. Банк закрылся, а команда Untitled Bank осталась вместе и растёт к следующему большому проекту.",
          link: { href: "https://untitlednow.com/", label: "untitlednow.com ↗" },
        },
      ],
    },
    archive: {
      heading: "/ было",
      headingGlitch: "// было",
      teaser: "Пятнадцать лет, семь мест, пять стран: банки, adult, космос, IoT, госсектор.",
      aboutLink: "подробнее на about ↗",
      items: [
        {
          years: "2023 — 25",
          name: "Untitled Bank",
          href: "https://untitlednow.com/",
          line: "Co-CEO и CTO. Команда выросла до 150 человек. Свой core banking, а ещё EMV, 3DS и HSM. Лицензию отозвали до запуска. Узбекистан.",
        },
        {
          years: "2022 — 23",
          name: "OnlyFans",
          line: "Head of Engineering. Платежи и инструменты для авторов. Великобритания.",
        },
        {
          years: "2021 — 23",
          name: "Precious Payload",
          href: "https://www.linkedin.com/company/preciouspayload",
          line: "Сооснователь и CTO. SaaS для спутниковых миссий. ОАЭ.",
        },
        {
          years: "2020 — 21",
          name: "Palebluedot",
          line: "CTO. Мобильные приложения и трекеры привычек, в том числе Fabble, OneSpace, Codewards. ОАЭ.",
        },
        {
          years: "2017 — 18",
          name: "Moeco",
          href: "https://moeco.io/",
          line: "Tech lead, затем co-CTO. Блокчейн-сеть для IoT, раунд $5 млн от Bitfury в 2017. Германия.",
        },
        {
          years: "2015 — 20",
          name: "RentaTeam",
          href: "https://www.rentateam.ru/",
          line: "Сооснователь и CTO. Студия мобильной и веб-разработки: Dodo, Volkswagen, VCV, Timepad. Россия.",
        },
        {
          years: "2010 — 15",
          name: "Минцифры",
          line: "От разработчика до тимлида. Внутренние системы. Россия.",
        },
      ],
    },
    podcast: {
      metaPlate: "04 · ШИТБАСТАРДС",
      metaWith: "mike zharchev",
      metaEpisodes: "{count} эп. · S{season}",
      metaOnAir: "since {since}",
      footTemplate: "Некультурно-разговорный подкаст про жизнь, технологии, музыку и всё подряд. Два ведущих, ноль сценария. С Майком Жарчевым, с {since}.",
      metaFallback: [
        { key: "WITH", value: "mike zharchev" },
        { key: "ON AIR", value: "since mar 2024 · S2" },
      ],
      heading: "ШИТБАСТАРДС",
      headingGlitch: "ШИТБАСТАРДС",
      ticker: "★ ON AIR · ШИТБАСТАРДС · ЖИЗНЬ · ЛЮДИ · S2 · ",
      tickerBrand: "ШИТБАСТАРДС",
      onAir: "ON AIR",
      foot: "Некультурно-разговорный подкаст про жизнь, технологии, музыку и всё подряд. Два ведущих, ноль сценария. С Майком Жарчевым, с марта 2024.",
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
      ctaHint: "На весь экран, со звуком. Начнётся от клика или движения мыши.",
      exitLabel: "← mxsm",
    },
    mask: {
      meta: [
        { key: "TYPE", value: "pin art · glass" },
        { key: "STACK", value: "three.js · webgl" },
      ],
      heading: "/ mask",
      headingGlitch: "// mask",
      ctaHint: "Маску можно крутить, а по клику переворачивать: с одной стороны пин-арт, с другой стекло.",
      exitLabel: "← mxsm",
    },
    contact: {
      heading: "/ написать",
      headingGlitch: "// написать",
      hint: "Пишите про менторство, разбор архитектуры или аудит расходов на разработку. Письма читаю сам, так что ответ иногда идёт больше недели.",
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
      skull: "skull",
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
