import { PlateHead } from "@/components/ui/PlateHead";
import { GlitchText } from "@/components/ui/GlitchText";
import type { Dictionary } from "@/i18n/types";

type PlateCurrentlyProps = {
  dict: Dictionary;
};

export function PlateCurrently({ dict }: PlateCurrentlyProps) {
  const p = dict.plates.currently;

  return (
    <section className="plate" id="plate-02" aria-labelledby="h-02">
      <PlateHead rows={p.meta} title={p.heading} titleGlitch={p.headingGlitch} titleId="h-02" />

      <div className="roles">
        {p.roles.map((role) => (
          <article key={role.n} className="role" data-n={role.n}>
            <div className="role-spine">
              <span className="role-n">{role.n}</span>
              <span className="role-bar" aria-hidden="true" />
              <span className="role-status">{p.live}</span>
            </div>
            <div className="role-body">
              <h3 className="role-name">
                {role.href ? (
                  <a href={role.href} rel="noopener noreferrer">
                    <GlitchText text={role.name}>{role.name}</GlitchText>
                    <span className="role-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ) : (
                  <GlitchText text={role.name}>{role.name}</GlitchText>
                )}
              </h3>
              <ul className="kv">
                {role.kv.map((item) => (
                  <li key={item.key}>
                    <span>{item.key}</span>
                    {item.href ? (
                      <a href={item.href} rel="noopener noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
