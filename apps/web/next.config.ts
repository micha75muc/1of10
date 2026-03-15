import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/policy"],
};

export default nextConfig;
