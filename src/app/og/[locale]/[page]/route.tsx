import { isLocale } from "@/i18n/config";
import { isOgPage, renderOgImage } from "@/lib/seo/og-render";

type RouteParams = {
  params: Promise<{ locale: string; page: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { locale: raw, page } = await params;

  if (!isLocale(raw) || !isOgPage(page)) {
    return new Response("Not found", { status: 404 });
  }

  return renderOgImage(page, raw);
}
