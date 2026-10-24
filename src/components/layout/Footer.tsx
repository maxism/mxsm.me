"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { localeAboutPath, localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

type FooterProps = {
  dict: Dictionary;
  locale: Locale;
};

const subscribe = () => () => {};
const picked = new WeakMap<readonly string[], string>();

/** One random line per page load; the server HTML and hydration always show the first. */
function pickLine(lines: readonly string[]): string {
  let line = picked.get(lines);
  if (line === undefined) {
    line = lines[Math.floor(Math.random() * lines.length)] ?? "";
    picked.set(lines, line);
  }
  return line;
}

export function Footer({ dict, locale }: FooterProps) {
  const lines = dict.footer.lines;
  const line = useSyncExternalStore(
    subscribe,
    () => pickLine(lines),
    () => lines[0] ?? "",
  );

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
      <span className="colo-aside">{line}</span>
    </footer>
  );
}
