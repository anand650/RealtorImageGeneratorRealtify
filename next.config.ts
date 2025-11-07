import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better performance and smaller Docker images
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Image optimization configuration
  images: {
    // Allow images from S3
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Environment variables available on client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_S3_REGION: process.env.S3_REGION || process.env.AWS_REGION,
    NEXT_PUBLIC_S3_BUCKET: process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
};

export default nextConfig;
