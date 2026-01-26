import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  compress: true,
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'react-icons',
      '@clerk/nextjs',
      'react-icons/fa',
      'react-countup',
      'react-type-animation'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/rust/:path*',
        destination: 'http://localhost:8080/:path*', // Proxy to Rust service
      },
    ];
  },
};

export default withNextIntl(nextConfig);