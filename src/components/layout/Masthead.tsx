import Link from "next/link";
import { GlitchText } from "@/components/ui/GlitchText";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { navPlates } from "@/lib/shared-data";

type MastheadProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Masthead({ locale, dict }: MastheadProps) {
  return (
    <header className="mast" role="banner">
      <div className="mast-l">
        <span className="m-ref">MU·2026</span>
        <GlitchText as="span" text="Max Ulianov" className="m-id" />
        <div
          className="lang"
          role="group"
          aria-label={dict.masthead.langSwitch}
        >
          <Link
            href={localePath("ru")}
            className={locale === "ru" ? "lang-on" : "lang-off"}
            lang="ru"
            hrefLang="ru"
            aria-current={locale === "ru" ? "page" : undefined}
          >
            RU
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={localePath("en")}
            className={locale === "en" ? "lang-on" : "lang-off"}
            lang="en"
            hrefLang="en"
            aria-current={locale === "en" ? "page" : undefined}
          >
            EN
          </Link>
        </div>
      </div>
      <nav className="mast-r" aria-label={dict.nav.primary}>
        {navPlates.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
