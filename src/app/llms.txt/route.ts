import { buildLlmsTxt } from "@/lib/seo/llms";
import { plainTextResponse } from "@/lib/seo/text-response";

export const revalidate = 3600;

export function GET() {
  return plainTextResponse(buildLlmsTxt());
}
