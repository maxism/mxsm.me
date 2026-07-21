import type { AboutContent } from "@/i18n/about/types";
import { contacts, SHITBUSTARDS_ORIGIN } from "@/lib/shared-data";

const [github, linkedin, telegram] = contacts;

export const aboutRu: AboutContent = {
  meta: {
    title: "Макс Ульянов — about · CTO MTS.ai",
    description:
      "Макс Ульянов — CTO MTS.ai, сооснователь Untitled Team, подкаст Шитбастардс, mxsm/signal. Москва. 15 лет в инжиниринге и оргстроительстве.",
    ogDescription: "кто, чем занят, откуда — без linkedin-лексики.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "не резюме и не pitch deck. развёрнутые заметки для тех, кому нужен контекст — и для машин, которые читают сайты вслух. главная — сжатая версия, здесь — чуть больше воздуха между строк.",
  },
  sections: [
    {
      id: "who",
      heading: "/ кто",
      paragraphs: [
        "Макс Ульянов, @maxism. he/him. Москва, UTC+3.",
        "инженер и математик — мама решила раньше всех и оказалась права.",
        [
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          " · 15 лет — инжиниринг, продукт, оргстроительство: от кода и архитектуры до найма и того, как на самом деле идёт неделя.",
        ],
        "обычно прихожу туда, где нужно собрать команду и систему с нуля — или распутать то, что выросло быстрее, чем успели договориться.",
        "МИФИ, магистр (2005–2010). до этого — ФМЛ №1580.",
      ],
    },
    {
      id: "now",
      heading: "/ сейчас",
      paragraphs: [
        "CTO @ MTS.ai — с декабря 2025. нейропоиск. под NDA деталей нет, и это нормально: работа есть, хвастовства нет.",
        "сооснователь Untitled Team — с 2025. команда, собранная в Untitled Bank: после закрытия мы её сохранили и растим — людей и уровень — до следующего большого проекта. с Майком Жарчевым и Артёмом Харченко.",
        [
          "подкаст Шитбастардс — с марта 2024. про жизнь и людей — без айти. соведущий — Майк Жарчев. ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
        "mxsm/signal — сорвалось из головы. webgl, web audio, параллельный текст. без замысла — вход с главной, plate 05.",
        "mxsm/mask — мой внутренний мир. лицо в браузере, материалы на разворот.",
      ],
    },
    {
      id: "work",
      heading: "/ чем занимаюсь",
      paragraphs: [
        "большую часть времени: нанимаю и удерживаю людей, задаю как работа идёт от идеи до продакшена, чиню то, что ломается на масштабе.",
        "люди и оргструктуры: грейды, перформанс-ревью, коучинг лидов, преемственность — то, что переживает релиз.",
        "delivery: cadence, бюджеты, инциденты, DORA — без all-hands про «прозрачность».",
        "платформы: распределённые системы, data, mobile, cloud — там, где плохой деплой стоит денег.",
        "стек: go · java · kotlin · python · ts/js · node · react/vue · docker/k8s · postgres · redis · kafka · … — под задачу, не под тред.",
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
        "если нужен разговор про жизнь и людей без фильтра — это Шитбастардс, не эта страница.",
      ],
    },
    {
      id: "reach",
      heading: "/ связь",
      paragraphs: [
        [
          "пиши на ",
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          " — лучший способ дойти до меня.",
        ],
        "хорошие поводы: менторство, architecture review, аудит инженерных расходов. читаю всё и отвечаю сам, поэтому иногда до недели.",
        [
          { href: github.href, label: "github" },
          " · ",
          { href: linkedin.href, label: "linkedin" },
          " · ",
          { href: telegram.href, label: "telegram" },
          ". подкаст — ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
      ],
    },
  ],
  backLink: "← главная",
  archiveLink: { href: "/#plate-03", label: "архив ролей" },
};
