/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: ['lcmaaossplssflfrrank.supabase.co'],
  },
};

module.exports = nextConfig;
