import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://lh3.googleusercontent.com/a/*"),
      new URL("https://placehold.co/**"),
      new URL("https://randomuser.me/**")
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
