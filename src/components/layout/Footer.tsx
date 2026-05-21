import Link from "next/link";
import { localeAboutPath, localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

type FooterProps = {
  dict: Dictionary;
  locale: Locale;
};

export function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="colo">
      <div className="colo-links">
        <Link href={localePath(locale)} className="colo-link">
          {dict.footer.home}
        </Link>
        <Link href={localeAboutPath(locale)} className="colo-link">
          {dict.footer.about}
        </Link>
      </div>
      <span>{dict.footer.copyright}</span>
    </footer>
  );
}
