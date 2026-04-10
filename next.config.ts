import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
  // Silence build warnings for mongoose
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
