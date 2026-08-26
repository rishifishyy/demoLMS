import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.12', 'localhost:3000', '192.168.*'],
};

export default nextConfig;
