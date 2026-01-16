import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["images.unsplash.com", "ik.imagekit.io","github.com"],
  },
};

export default nextConfig;
