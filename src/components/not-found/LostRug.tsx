"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RugCanvas } from "@/components/rug/RugCanvas";
import type { Rug } from "@/lib/rug";

type Props = {
  href: string;
  openLabel: string;
  /** school id → display name, for the label under the rug */
  names: Record<string, string>;
};

const WEAVE_MS = 2600;

/** One rug, woven once per visit. It is generated in the browser: the lib stays out of the 404's HTML. */
export function LostRug({ href, openLabel, names }: Props) {
  const [rug, setRug] = useState<Rug | null>(null);

  useEffect(() => {
    let stopped = false;
    void import("@/lib/rug").then((lib) => {
      if (stopped) return;
      const school = lib.SCHOOLS[Math.floor(Math.random() * lib.SCHOOLS.length)]!;
      setRug(lib.generateRug(lib.randomSeed(), school));
    });
    return () => {
      stopped = true;
    };
  }, []);

  if (!rug) return <div className="lost-rug" aria-hidden="true" />;

  return (
    <div className="lost-rug">
      <div className="rug-art" style={{ "--weave": `${WEAVE_MS}ms` } as React.CSSProperties}>
        <RugCanvas rug={rug} glyphs="blocks" className="rug-art-layer rug-art-layer--weave" />
        <span className="rug-art-shuttle" />
      </div>
      <Link
        href={`${href}?seed=${encodeURIComponent(rug.seed)}&school=${rug.school}`}
        className="lost-rug-open"
      >
        {names[rug.school] ?? rug.school} · {rug.seed} · {openLabel}
      </Link>
    </div>
  );
}
