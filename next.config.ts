import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.63', '192.168.1.152'],
  reactStrictMode: true,
  compress: true,
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [390, 430, 768, 1024, 1280],
    imageSizes: [32, 64, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '1001traveldestinations.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: 'www.worldatlas.com',
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
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
    ],
  },
  experimental: {
    // Smoother route morphing in supported browsers (Chrome 126+)
    viewTransition: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'react-icons',
      'react-icons/fa',
      'react-countup',
      'react-type-animation'
    ],
    // Inline small CSS for faster initial paint
    optimizeCss: false,
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      // Static Next.js chunks — immutable (1 year, production only)
      ...(isProd ? [{
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      }] : []),
      // Public assets
      {
        source: '/:path(.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2?))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' }],
      },
      // Public API responses
      {
        source: '/api/(events|news|banners|shopping|lessons)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=30' }],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/rust/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);