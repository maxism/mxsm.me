import Link from "next/link";
import { localeAboutPath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

type FooterProps = {
  dict: Dictionary;
  locale: Locale;
};

export function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="colo">
      <Link href={localeAboutPath(locale)} className="colo-about">
        {dict.footer.about}
      </Link>
      <span>{dict.footer.copyright}</span>
    </footer>
  );
}
