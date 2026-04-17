import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling Node.js-only packages server-side
  serverExternalPackages: ["@0glabs/0g-ts-sdk", "ethers"],

  eslint: {
    // ESLint errors are warnings only during build — we rely on CI for enforcement
    ignoreDuringBuilds: false,
  },

  typescript: {
    // Type check happens separately; don't block build for type errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
