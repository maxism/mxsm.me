import type { Viewport } from "next";
import { RootShell } from "@/components/layout/RootShell";
import NotFound from "./not-found";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0b09",
};

/** Unmatched URLs have no locale segment, so the 404 brings its own `<html>` (the copy is bilingual). */
export default function GlobalNotFound() {
  return (
    <RootShell lang="ru">
      <NotFound />
    </RootShell>
  );
}
