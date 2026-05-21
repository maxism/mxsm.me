export function plainTextResponse(
  body: string,
  cacheControl = "public, max-age=3600, stale-while-revalidate=86400",
) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

export function markdownResponse(
  body: string,
  cacheControl = "public, max-age=3600, stale-while-revalidate=86400",
) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
