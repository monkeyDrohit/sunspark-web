import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // This helps prevent memory leaks in production on limited environments
  experimental: {
    // optimizePackageImports: ['lucide-react', 'date-fns'],
  }
};

export default nextConfig;
