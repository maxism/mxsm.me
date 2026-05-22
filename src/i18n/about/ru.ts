import type { AboutContent } from "@/i18n/about/types";

export const aboutRu: AboutContent = {
  meta: {
    title: "Макс Ульянов — about · CTO MTS.ai",
    description:
      "Макс Ульянов: CTO MTS.ai, со-основатель Untitled Team, подкаст Шитбастардс, mxsm/signal. Москва. 15+ лет в инжиниринге и оргстроительстве.",
    ogDescription: "развёрнутый чертёж: кто, чем занят, откуда пришёл. без linkedin-лексики.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "это не резюме и не pitch deck. развёрнутые заметки для людей и для машин, которые читают вслух. главная — чертёж в сжатом виде, здесь — чуть больше воздуха между строк.",
  },
  sections: [
    {
      id: "who",
      heading: "/ кто",
      paragraphs: [
        "Макс Ульянов, max ulianov, @maxism. he/him. Москва, UTC+3.",
        "m@mxsm.me · 15+ лет — инжиниринг, продукт, оргстроительство: от кода и архитектуры до найма и operating cadence.",
        "обычно прихожу туда, где нужно собрать команду и систему с нуля — или распутать то, что выросло быстрее, чем успели договориться.",
        "МИФИ, магистр (2005–2010). до этого — ФМЛ №1580.",
      ],
    },
    {
      id: "now",
      heading: "/ сейчас",
      paragraphs: [
        "CTO @ MTS.ai — с декабря 2025. генеративный нейропоиск. под NDA деталей нет, и это нормально: работа есть, хвастовства нет.",
        "co-founder Untitled Team — с 2025, перезапуск после Untitled Bank. с Mike Zharchev и Artem Kharchenko.",
        "подкаст Шитбастардс — с марта 2024. со-ведущий — Майк Жарчев (в эфире Микос). shitbustards.ru.",
        "mxsm/signal — генеративный арт на этом домене: webgl, web audio, три голоса. не объясняет себя — вход с главной, plate 05.",
      ],
    },
    {
      id: "work",
      heading: "/ чем занимаюсь",
      paragraphs: [
        "люди и оргструктуры: найм в масштабе, ладдеры, performance, коучинг лидов, succession — когда роли живут дольше одного релиза.",
        "delivery: operating cadence, бюджеты, discovery → delivery, инциденты, DORA, SLA, OKR — без театра «прозрачности».",
        "архитектура и платформы: распределённые системы, data, mobile, cloud, observability — там, где ошибка стоит дороже отката.",
        "продукт: portfolio, дорожные карты, эксперименты, аналитика, guardrails — без слова «синергия».",
        "стек: go · java · kotlin · python · ts/js · node · react/vue · docker/k8s · postgres · redis · kafka · spark · elastic · … — инструмент под задачу, не вероисповедание.",
      ],
    },
    {
      id: "path",
      heading: "/ откуда",
      paragraphs: [
        "география: Россия → Германия → ОАЭ → UK → Узбекистан → снова Россия.",
        "банкинг (Untitled Bank), adult (OnlyFans), space (Precious Payload), iot (Moeco), студия (RentaTeam), gov (Минцифры) — разные отрасли, похожие задачи: масштаб, регуляторика, платежи, команды.",
        "запускал Launch.ctrl, Fabble, OneSpace, Codewards. через студию — Dodo, VW, VCV, Timepad.",
      ],
      note: "полная хронология с датами — на главной, plate 03.",
      link: { href: "/#plate-03", label: "архив на mxsm.me ↗" },
    },
    {
      id: "talks",
      heading: "/ эфиры",
      paragraphs: [
        "PLUS-Forum Digital Uzbekistan, май 2025, Ташкент — с Майком Жарчевым: как пытались поднять безымянный банк и где ломается реальность быстрее роадмапа.",
        "если нужен формат подкаста без фильтра — это Шитбастардс, не эта страница.",
      ],
    },
    {
      id: "reach",
      heading: "/ связь",
      paragraphs: [
        "пиши на m@mxsm.me — лучший способ дойти до меня.",
        "отвечаю в течение недели, иногда дольше. selective по встречам и проектам — не из вежливости, из загрузки и качества внимания.",
        "github · linkedin · telegram — на главной, plate 06. подкаст — shitbustards.ru.",
      ],
    },
  ],
  backLink: "← главная",
  archiveLink: { href: "/#plate-03", label: "архив ролей" },
};
