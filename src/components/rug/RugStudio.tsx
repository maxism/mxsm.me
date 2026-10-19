"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./rug.css";
import { RugCanvas } from "./RugCanvas";
import type { Dictionary } from "@/i18n/types";
import {
  generateRug,
  normalizeSeed,
  randomSeed,
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

  // The rug is drawn in the browser only: its ASCII is thousands of nodes and the SVG hundreds of
  // kilobytes, and sending them in the server HTML would slow every phone down for nothing.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // typing a seed stays instant; the rug follows when the browser has a moment
  const liveSeed = useDeferredValue(seed);
  const rug = useMemo(
    () => (mounted ? generateRug(liveSeed, school, density) : null),
    [mounted, liveSeed, school, density],
  );
  const shownSeed = rug?.seed ?? normalizeSeed(seed);
  const caption = `${copy.sheetCaption} · ${copy.schools[school].name} · ${shownSeed}`;

  // the vector sheet is only built when someone prints
  const [printing, setPrinting] = useState(false);
  const svg = useMemo(
    () => (printing && rug ? rugSvg(rug, caption) : ""),
    [printing, rug, caption],
  );
  const [printAsked, setPrintAsked] = useState(false);
  useEffect(() => {
    if (!printAsked || !svg) return;
    const id = window.requestAnimationFrame(() => {
      window.print();
      setPrintAsked(false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [printAsked, svg]);

  // the address bar always names the rug on screen, so any state can be sent as a link
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("seed", shownSeed);
    url.searchParams.set("school", school);
    window.history.replaceState(null, "", url);
  }, [shownSeed, school]);

  // on a phone the school chips scroll sideways; keep the chosen one in view
  const schoolsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = schoolsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [school]);

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
    if (!rug) return;
    const blob = new Blob([rugSvg(rug, caption)], { type: "image/svg+xml" });
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

        <div ref={schoolsRef} className="rug-schools" role="tablist" aria-label="school">
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
        <p className="rug-variant">{rug?.variant ?? ""}</p>

        <div className="rug-segs">
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
        </div>
        <p className="rug-hint">
          {copy.detail}: {copy.detailHint}
        </p>

        <div className="rug-buttons">
          <button
            type="button"
            className="rug-primary"
            onClick={() => {
              setPrinting(true);
              setPrintAsked(true);
            }}
          >
            {copy.print}
          </button>
          <button type="button" onClick={saveSvg}>
            {copy.saveSvg}
          </button>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                `${window.location.origin}${path}?seed=${encodeURIComponent(shownSeed)}&school=${school}`,
              )
            }
          >
            {copy.copyLink}
          </button>
        </div>
        <p className="rug-hint">{copy.printHint}</p>
      </aside>

      <main
        className="rug-stage"
        style={
          { "--rw": rug?.w ?? 80 * density, "--rh": rug?.h ?? 112 * density } as React.CSSProperties
        }
      >
        <div className="rug-canvas-box">
          {rug && <RugCanvas rug={rug} glyphs={glyphs} className="rug-canvas" label={caption} />}
        </div>
        <div className="rug-sheet" dangerouslySetInnerHTML={{ __html: svg }} />
        <span className="rug-flash" data-on={flash} aria-live="polite">
          {flash ? copy.copied : ""}
        </span>
      </main>
    </div>
  );
}
