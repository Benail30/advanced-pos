/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Enable strict mode
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Configure images
  images: {
    domains: [
      's.gravatar.com',
      'cdn.auth0.com',
      'images.unsplash.com',
    ],
  },
  // Configure webpack
  webpack: (config) => {
    // Important: Return the modified config
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
    };
    
    return config;
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/pages/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
  // Configure rewrites
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  }
};

module.exports = nextConfig; 