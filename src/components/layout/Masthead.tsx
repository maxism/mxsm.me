"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeAboutPath, localeHref, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { navPlates } from "@/lib/shared-data";

type MastheadProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Masthead({ locale, dict }: MastheadProps) {
  const pathname = usePathname();
  const aboutHref = localeAboutPath(locale);
  const onAbout = pathname === aboutHref;

  return (
    <nav className="rail" aria-label={dict.nav.primary}>
      <span className="rail-meter" aria-hidden="true" />
      <Link href={localePath(locale)} data-plate="plate-01" className="rail-link">
        {dict.masthead.place}
      </Link>
      <Link
        href={aboutHref}
        className="rail-link"
        aria-current={onAbout ? "page" : undefined}
      >
        {dict.nav.about}
      </Link>
      {navPlates.map((item) => (
        <Link
          key={item.href}
          href={localeHref(locale, item.href)}
          data-plate={item.href.slice(1)}
          className="rail-link"
        >
          {dict.nav.plates[item.key]}
        </Link>
      ))}
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
    </nav>
  );
}
