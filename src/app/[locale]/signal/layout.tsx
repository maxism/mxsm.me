import "@/signal/signal.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveLocale } from "@/i18n/config";
import { webSiteJsonLd } from "@/i18n/json-ld";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SignalLayout({ children, params }: LayoutProps) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd data={webSiteJsonLd(locale)} />
      <div className="signal-route">{children}</div>
    </>
  );
}
