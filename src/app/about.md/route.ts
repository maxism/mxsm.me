import { buildAboutMarkdown } from "@/lib/seo/llms";
import { markdownResponse } from "@/lib/seo/text-response";

export const revalidate = 3600;

export function GET() {
  return markdownResponse(buildAboutMarkdown("ru"));
}
