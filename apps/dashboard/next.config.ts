import path from "node:path";
import type { NextConfig } from "next"; 

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
};


if (process.env.NODE_ENV === "development") {
  nextConfig.outputFileTracingRoot = path.join(__dirname, "../../");
}

export default nextConfig;