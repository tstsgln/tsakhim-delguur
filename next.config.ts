import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  serverExternalPackages: ["better-sqlite3"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
