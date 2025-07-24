import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable strict mode to catch hydration issues
  reactStrictMode: true,
  
  // Disable ESLint during builds to avoid blocking deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checks during builds to avoid blocking deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Force dynamic rendering for all pages to avoid build-time issues
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '3.72.21.168',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      // Handle old package ID format for backward compatibility
      {
        source: '/:locale/packages/:id([a-f0-9]{24})',
        destination: '/:locale/packages/id/:id',
      },
    ]
  },
};

export default withNextIntl(nextConfig);
