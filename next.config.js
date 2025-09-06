/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static optimization completely
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static generation
  distDir: '.next',
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', 'lucide-react'],
  },
  webpack: (config) => {
    // Optimize bundle splitting for better performance
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        charts: {
          test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
          name: 'charts',
          chunks: 'all',
        },
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|framer-motion)[\\/]/,
          name: 'ui',
          chunks: 'all',
        },
      },
    };
    return config;
  },
  // Disable static optimization to avoid build issues
  // output: 'standalone',
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;