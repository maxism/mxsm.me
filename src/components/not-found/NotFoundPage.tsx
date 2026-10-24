import Link from "next/link";
import { FieldBackground } from "@/components/effects/FieldBackground";
import { LostRug } from "@/components/not-found/LostRug";
import { localeHref, localeRugPath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/** The page that is not there: the number is cut like the name on the home page, with the live map
 *  below and a rug the loom weaves while you read. */
export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.notFound;
  const names = Object.fromEntries(
    Object.entries(dict.rugPage.schools).map(([id, s]) => [id, s.name]),
  );

  return (
    <div className="lost-page">
      <FieldBackground />
      <main className="lost">
        <div className="lost-top" aria-hidden="true" />
        <h1 className="lost-num">
          404
          <span className="lost-num-cut" aria-hidden="true">
            404
          </span>
        </h1>
        <div className="lost-foot">
          <div className="lost-text">
            <p className="lost-line">{t.line}</p>
            <p className="lost-loom">{t.loom}</p>
            <Link href={localeHref(locale)} className="lost-home">
              {t.home}
            </Link>
          </div>
          <LostRug href={localeRugPath(locale)} openLabel={t.openRug} names={names} />
        </div>
      </main>
    </div>
  );
}
