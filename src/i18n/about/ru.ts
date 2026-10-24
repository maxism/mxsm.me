import type { AboutContent } from "@/i18n/about/types";
import { contacts, SHITBUSTARDS_ORIGIN } from "@/lib/shared-data";

const [github, linkedin, telegram] = contacts;

export const aboutRu: AboutContent = {
  meta: {
    title: "Макс Ульянов — about · CTO MWS AI",
    description:
      "Макс Ульянов, CTO в MWS AI и CTPO её платформы для ИИ-агентов. Москва. Чем занят сейчас, где работал раньше, как связаться.",
    ogDescription: "Кто я, чем занят и где работал.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "Чуть подробнее, чем на главной.",
  },
  sections: [
    {
      id: "who",
      heading: "/ кто",
      paragraphs: [
        "Макс Ульянов, @maxism.",
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
        "В MWS AI (бывшая MTS AI, группа МТС) с декабря 2025. Сейчас отвечаю за Искру и MWS AI Agents Platform: технологии и продукт. Подробности под NDA.",
        "Сооснователь Untitled Team с 2025, вместе с Майком Жарчевым и Артёмом Харченко. Это команда из Untitled Bank: после закрытия банка мы остались вместе.",
        [
          "Подкаст «Шитбастардс» с марта 2024: некультурно-разговорный, про жизнь, технологии, музыку и всё подряд. Соведущий — Майк Жарчев. ",
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
        "Стек под задачу: Go, Java, Kotlin, Python, TypeScript, React, Vue, Docker, Kubernetes, Postgres, Redis, Kafka.",
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
        "Разговоры обо всём остальном — в подкасте «Шитбастардс».",
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
