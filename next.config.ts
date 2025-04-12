import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10.5mb',
      allowedOrigins:['localhost:9002', '.github.dev'],
    },
   
  },
};

export default nextConfig;