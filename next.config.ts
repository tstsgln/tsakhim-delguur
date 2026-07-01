import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  serverExternalPackages: ["better-sqlite3"],
  // Upload зургууд (/uploads/...) нь runtime-д бичигддэг тул next start тэднийг
  // serve хийдэггүй → next/image optimizer унадаг. nginx /uploads-ийг шууд serve
  // хийдэг тул optimizer-ийг унтраагаад browser-т шууд ачаалуулна.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
