import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tuereaugboyscqlvuskt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/locker', destination: 'https://locker.steakhouse.finance' },
      { source: '/explore', destination: 'https://explore.steakhouse.finance' },
      { source: '/trading-chart/:token', destination: 'https://curve.steakhouse.finance/:token' },
    ];
  },
};

export default nextConfig;
