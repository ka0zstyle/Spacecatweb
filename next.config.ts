import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ["http://192.168.0.197:3000", "192.168.0.197"],
};

export default nextConfig;
