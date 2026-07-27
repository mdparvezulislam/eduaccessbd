import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 🔥 VERY IMPORTANT for VPS (low RAM)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },


  // 🧠 Disable heavy image optimization (saves RAM)
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;