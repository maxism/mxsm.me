import type { AboutContent } from "@/i18n/about/types";
import { contacts, SHITBUSTARDS_ORIGIN } from "@/lib/shared-data";

const [github, linkedin, telegram] = contacts;

export const aboutRu: AboutContent = {
  meta: {
    title: "Макс Ульянов — about · CTO MTS.ai",
    description:
      "Макс Ульянов, CTO в MTS.ai. Москва. Чем занят сейчас, где работал раньше, как связаться.",
    ogDescription: "Кто я, чем занят и где работал.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "Здесь чуть подробнее, чем на главной: кто я, чем занят и где работал.",
  },
  sections: [
    {
      id: "who",
      heading: "/ кто",
      paragraphs: [
        "Макс Ульянов, @maxism. Москва, UTC+3.",
        "Инженер. Пятнадцать лет занимаюсь разработкой, продуктом и командами.",
        [
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          " — сюда лучше всего писать.",
        ],
        "МИФИ, магистратура, 2005–2010. До этого — физматшкола №1580.",
      ],
    },
    {
      id: "now",
      heading: "/ сейчас",
      paragraphs: [
        "CTO в MTS.ai с декабря 2025. Нейропоиск. Подробности под NDA.",
        "Сооснователь Untitled Team с 2025, вместе с Майком Жарчевым и Артёмом Харченко. Это команда из Untitled Bank: после закрытия банка мы остались вместе.",
        [
          "Подкаст «Шитбастардс» с марта 2024. Про жизнь и людей, без рабочих тем. Соведущий — Майк Жарчев, в эфире Микос. ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
        "mxsm/signal — эксперимент в браузере: звук и текст на WebGL. Открывается с главной.",
        "mxsm/mask — маска в браузере. С одной стороны пин-арт, с другой стекло.",
      ],
    },
    {
      id: "work",
      heading: "/ чем занимаюсь",
      paragraphs: [
        "Большую часть времени нанимаю людей, держу команду и смотрю, как задача доходит до продакшена.",
        "По людям: грейды, ревью, разговоры с лидами, кто кого подменяет.",
        "По процессу: ритм работы, бюджеты, инциденты, метрики DORA.",
        "По системам: распределённые системы, данные, мобильная разработка, облако.",
        "Стек под задачу: Go, Java, Kotlin, Python, TypeScript, React, Vue, Docker, Kubernetes, Postgres, Redis, Kafka. Остальное по необходимости.",
      ],
    },
    {
      id: "path",
      heading: "/ откуда",
      paragraphs: [
        "Работал в России, Германии, ОАЭ, Великобритании и Узбекистане. Сейчас снова в России.",
        "Отрасли: банки (Untitled Bank), adult (OnlyFans), космос (Precious Payload), IoT (Moeco), заказная разработка (RentaTeam), государство (Минцифры).",
        "Из продуктов: Launch.ctrl, Fabble, OneSpace, Codewards. Через студию — Dodo, Volkswagen, VCV, Timepad.",
      ],
      note: "Даты по местам работы — на главной.",
      link: { href: "/#plate-03", label: "архив на mxsm.me ↗" },
    },
    {
      id: "talks",
      heading: "/ эфиры",
      paragraphs: [
        "PLUS-Forum Digital Uzbekistan, май 2025, Ташкент. Вместе с Майком Жарчевым рассказывали, как собирали Untitled Bank.",
        "Разговоры не про работу — в подкасте «Шитбастардс».",
      ],
    },
    {
      id: "reach",
      heading: "/ связь",
      paragraphs: [
        [
          "Пишите на ",
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          ".",
        ],
        "Могу поговорить про менторство, разбор архитектуры и расходы на разработку. Отвечаю сам, иногда это занимает больше недели.",
        [
          { href: github.href, label: "github" },
          " · ",
          { href: linkedin.href, label: "linkedin" },
          " · ",
          { href: telegram.href, label: "telegram" },
          ". Подкаст — ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
      ],
    },
  ],
  backLink: "← главная",
  archiveLink: { href: "/#plate-03", label: "где работал" },
};
