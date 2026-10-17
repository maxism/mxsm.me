"use client";

import { usePathname } from "next/navigation";

type NameGlassProps = {
  name: string;
};

/** Paper above the seam, the name sliced on the line, the field below. */
export function NameGlass({ name }: NameGlassProps) {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/en";
  if (!home) return null;

  return (
    <>
      <div className="seam-paper" aria-hidden="true" />
      <p className="name-cut" aria-hidden="true">
        {name}
      </p>
    </>
  );
}
