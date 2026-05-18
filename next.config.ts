import type { NextConfig } from "next";

// Not: Next 16 App Router'da Strict Mode zaten varsayılan true; niyeti
// belgelemek için açıkça yazıldı. next/image varsayılan formatı WebP içerir
// (spec §10.11: WebP zorunlu, AVIF opsiyonel) — ek format override gerekmedi.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
