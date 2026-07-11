import { GlitchText } from "@/components/ui/GlitchText";
import { PlateHead } from "@/components/ui/PlateHead";
import type { Dictionary } from "@/i18n/types";
import { contacts } from "@/lib/shared-data";

type PlateContactProps = {
  dict: Dictionary;
};

export function PlateContact({ dict }: PlateContactProps) {
  const p = dict.plates.contact;

  return (
    <section className="plate" id="plate-07" aria-labelledby="h-07">
      <PlateHead
        title={p.heading}
        titleGlitch={p.headingGlitch}
        titleId="h-07"
        minimal
      />

      <div className="contact-main">
        <GlitchText as="a" href="mailto:m@mxsm.me" text="m@mxsm.me" className="contact-mail" />
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
