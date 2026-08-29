import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets verification builds coexist with a local development server.
  distDir: process.env.NEXT_BUILD_DIR || ".next",
};

export default nextConfig;
