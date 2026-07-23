import type { NextConfig } from "next";
import path from "node:path";

const devOrigins = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: devOrigins,
  turbopack: { root: path.join(import.meta.dirname ?? __dirname, ".") },
};

export default nextConfig;
