"use client";

import { useSelectedLayoutSegment } from "next/navigation";

type NameGlassProps = {
  name: string;
};

/** Paper above the seam, the name sitting on it, the field below. */
export function NameGlass({ name }: NameGlassProps) {
  // The segment, not the URL: the proxy rewrites "/" to "/ru", so the prerendered HTML and the
  // browser disagree about the pathname but agree about the route. No segment means the home page.
  const segment = useSelectedLayoutSegment();
  if (segment !== null) return null;

  return (
    <>
      <div className="seam-paper" aria-hidden="true" />
      <p className="name-cut" aria-hidden="true">
        {name}
      </p>
    </>
  );
}
