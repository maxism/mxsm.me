"use client";

import { usePathname } from "next/navigation";

type NameGlassProps = {
  name: string;
};

/** Fixed misregistered name. Hidden off the home page so about stays readable. */
export function NameGlass({ name }: NameGlassProps) {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/en";
  if (!home) return null;

  return (
    <p className="name-cut" aria-hidden="true">
      <span className="name-a">{name}</span>
      <span className="name-b">{name}</span>
    </p>
  );
}
