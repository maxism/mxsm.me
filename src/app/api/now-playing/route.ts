import { fetchNowPlaying } from "@/lib/lastfm";

export const revalidate = 30;

export async function GET() {
  const result = await fetchNowPlaying();

  return Response.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
