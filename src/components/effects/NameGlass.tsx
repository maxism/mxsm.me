"use client";

import { usePathname } from "next/navigation";

type NameGlassProps = {
  name: string;
};

/** One fixed word. Hidden off the home page so about stays a column of text. */
export function NameGlass({ name }: NameGlassProps) {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/en";
  if (!home) return null;

  return (
    <p className="name-cut" aria-hidden="true">
      {name}
    </p>
  );
}
