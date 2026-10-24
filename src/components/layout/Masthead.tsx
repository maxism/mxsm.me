"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { localeAboutPath, localeHref, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { navPlates } from "@/lib/shared-data";

type MastheadProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Masthead({ locale, dict }: MastheadProps) {
  const aboutHref = localeAboutPath(locale);
  // by route segment, not pathname: the server sees the rewritten "/ru/about", the browser "/about"
  const onAbout = useSelectedLayoutSegment() === "about";

  return (
    <nav className="rail" aria-label={dict.nav.primary}>
      <Link href={localePath(locale)} data-plate="plate-01" className="rail-link">
        <span className="rail-n" aria-hidden="true">
          01
        </span>
        {dict.nav.home}
      </Link>
      {navPlates.map((item, i) => (
        <Link
          key={item.href}
          href={localeHref(locale, item.href)}
          data-plate={item.href.slice(1)}
          className="rail-link"
        >
          <span className="rail-n" aria-hidden="true">
            {String(i + 2).padStart(2, "0")}
          </span>
          {dict.nav.plates[item.key]}
        </Link>
      ))}
      <div className="rail-foot">
        <Link
          href={aboutHref}
          className="rail-page"
          aria-current={onAbout ? "page" : undefined}
        >
          {dict.nav.about}
          <span aria-hidden="true"> ↗</span>
        </Link>
        <div className="rail-lang" role="group" aria-label={dict.masthead.langSwitch}>
          <Link
            href={localePath("ru")}
            className={locale === "ru" ? "lang-on" : "lang-off"}
            lang="ru"
            hrefLang="ru"
            aria-current={locale === "ru" ? "true" : undefined}
          >
            RU
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={localePath("en")}
            className={locale === "en" ? "lang-on" : "lang-off"}
            lang="en"
            hrefLang="en"
            aria-current={locale === "en" ? "true" : undefined}
          >
            EN
          </Link>
        </div>
      </div>
    </nav>
  );
}
