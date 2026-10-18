"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import "./rug.css";
import type { Dictionary } from "@/i18n/types";
import {
  generateRug,
  randomSeed,
  rugAsciiHtml,
  rugSvg,
  SCHOOLS,
  type Density,
  type GlyphSet,
  type School,
} from "@/lib/rug";

type Props = {
  backHref: string;
  path: string;
  copy: Dictionary["rugPage"];
  initialSeed: string;
  initialSchool: School;
};

function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="rug-seg">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RugStudio({ backHref, path, copy, initialSeed, initialSchool }: Props) {
  const [seed, setSeed] = useState(initialSeed);
  const [school, setSchool] = useState<School>(initialSchool);
  const [glyphs, setGlyphs] = useState<GlyphSet>("blocks");
  const [density, setDensity] = useState<Density>(1);
  const [flash, setFlash] = useState(false);

  // typing a seed stays instant; the rug follows when the browser has a moment
  const liveSeed = useDeferredValue(seed);
  const rug = useMemo(() => generateRug(liveSeed, school, density), [liveSeed, school, density]);
  const html = useMemo(() => rugAsciiHtml(rug, glyphs), [rug, glyphs]);
  const caption = `${copy.sheetCaption} · ${copy.schools[school].name} · ${rug.seed}`;
  const svg = useMemo(() => rugSvg(rug, caption), [rug, caption]);

  // the address bar always names the rug on screen, so any state can be sent as a link
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("seed", rug.seed);
    url.searchParams.set("school", school);
    window.history.replaceState(null, "", url);
  }, [rug.seed, school]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(false), 1400);
    return () => window.clearTimeout(id);
  }, [flash]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlash(true);
    } catch {
      setFlash(false);
    }
  };

  const saveSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `rug-${school}-${rug.seed}-${rug.w}x${rug.h}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="rug-page">
      <style>{`@media print { @page { margin: 0; } }`}</style>

      <aside className="rug-side">
        <div className="rug-head">
          <Link href={backHref} className="rug-back">
            {copy.exitLabel}
          </Link>
          <h1 className="rug-title">/ rug</h1>
        </div>

        <div className="rug-schools" role="tablist" aria-label="school">
          {SCHOOLS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={school === id}
              onClick={() => setSchool(id)}
            >
              {copy.schools[id].name}
            </button>
          ))}
        </div>
        <p className="rug-note">{copy.schools[school].note}</p>

        <div className="rug-seedrow">
          <label className="rug-seed">
            <span>{copy.seedLabel}</span>
            <input
              value={seed}
              maxLength={24}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setSeed(e.target.value)}
            />
          </label>
          <button type="button" className="rug-roll" onClick={() => setSeed(randomSeed())}>
            {copy.roll}
          </button>
        </div>
        <p className="rug-variant">{rug.variant}</p>

        <Segment
          value={glyphs}
          onChange={setGlyphs}
          options={[
            { id: "blocks", label: copy.glyphs.blocks },
            { id: "ascii", label: copy.glyphs.ascii },
          ]}
        />
        <Segment
          value={String(density) as "1" | "2"}
          onChange={(id) => setDensity(Number(id) as Density)}
          options={[
            { id: "1", label: "1×" },
            { id: "2", label: "2×" },
          ]}
        />
        <p className="rug-hint">
          {copy.detail}: {copy.detailHint}
        </p>

        <div className="rug-buttons">
          <button type="button" className="rug-primary" onClick={() => window.print()}>
            {copy.print}
          </button>
          <button type="button" onClick={saveSvg}>
            {copy.saveSvg}
          </button>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                `${window.location.origin}${path}?seed=${encodeURIComponent(rug.seed)}&school=${school}`,
              )
            }
          >
            {copy.copyLink}
          </button>
        </div>
        <p className="rug-hint">{copy.printHint}</p>
      </aside>

      <main className="rug-stage" style={{ "--rw": rug.w, "--rh": rug.h } as React.CSSProperties}>
        <pre
          className="rug-ascii"
          aria-label={caption}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="rug-sheet" dangerouslySetInnerHTML={{ __html: svg }} />
        <span className="rug-flash" data-on={flash} aria-live="polite">
          {flash ? copy.copied : ""}
        </span>
      </main>
    </div>
  );
}
