/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Enable static exports if needed
  // output: 'export',
  // Enable experimental features if needed
  experimental: {
    // appDir: true,
    // serverActions: true,
  },
};

module.exports = nextConfig; 