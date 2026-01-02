/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
    eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: true,
};

export default nextConfig;
