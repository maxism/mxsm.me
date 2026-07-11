import { fetchMusicFeed } from "@/lib/lastfm";

export const revalidate = 30;

export async function GET() {
  const feed = await fetchMusicFeed();

  return Response.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
