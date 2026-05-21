import type { Dictionary } from "@/i18n/types";

type FooterProps = {
  dict: Dictionary;
};

export function Footer({ dict }: FooterProps) {
  return (
    <footer className="colo">
      <span>{dict.footer.copyright}</span>
    </footer>
  );
}
