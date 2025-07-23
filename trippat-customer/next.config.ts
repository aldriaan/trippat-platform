import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
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
