import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const yandexMetrikaOrigins = [
  "https://mc.yandex.ru",
  "https://mc.yandex.com",
  "wss://mc.yandex.ru",
  "wss://mc.yandex.com",
];

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://www.googletagmanager.com",
  ...yandexMetrikaOrigins.filter((origin) => origin.startsWith("https://")),
].join(" ");

const connectSrc = [
  "'self'",
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  ...yandexMetrikaOrigins,
].join(" ");

const imgSrc = ["'self'", "data:", ...yandexMetrikaOrigins.filter((origin) => origin.startsWith("https://"))].join(
  " ",
);

const frameSrc = [
  ...yandexMetrikaOrigins.filter((origin) => origin.startsWith("https://")),
  "https://mc.webvisor.org",
].join(" ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      `connect-src ${connectSrc}`,
      `img-src ${imgSrc}`,
      `frame-src ${frameSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
