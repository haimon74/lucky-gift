import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lucky-gift/shared", "@lucky-gift/ui", "@lucky-gift/db"],
};

export default nextConfig;
