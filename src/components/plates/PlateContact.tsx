import { MoscowTime } from "@/components/plates/MoscowTime";
import { PlateHead } from "@/components/ui/PlateHead";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { contacts } from "@/lib/shared-data";

type PlateContactProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateContact({ dict, locale }: PlateContactProps) {
  const p = dict.plates.contact;

  return (
    <section className="plate" id="plate-08" aria-labelledby="h-08">
      <PlateHead
        title={p.heading}
        titleId="h-08"
        minimal
      />

      <div className="contact-main">
        <a href="mailto:m@mxsm.me" className="contact-mail">
          m@mxsm.me
        </a>
        <MoscowTime locale={locale} template={p.localTime} />
      </div>

      <p className="contact-hint">{p.hint}</p>

      <ul className="contact-list">
        {contacts.map((c) => (
          <li key={c.label}>
            <span>{c.label}</span>
            <a href={c.href} rel="noopener noreferrer me">
              {c.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
