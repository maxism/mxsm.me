const isProduction = process.env.NODE_ENV === "production";

function readYmId(): number | undefined {
  const raw = process.env.NEXT_PUBLIC_YM_ID?.trim();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || undefined;
export const YM_ID = readYmId();

export const gaEnabled = isProduction && Boolean(GA_ID);
export const ymEnabled = isProduction && Boolean(YM_ID);
export const analyticsEnabled = gaEnabled || ymEnabled;
