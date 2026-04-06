import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // This helps prevent memory leaks in production on limited environments
  experimental: {
    // optimizePackageImports: ['lucide-react', 'date-fns'],
  }
};

export default nextConfig;
