import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ← Skip ESLint checks when running `next build` on Vercel
    ignoreDuringBuilds: true,
  },
  /* your other config options here */
};

export default nextConfig;
