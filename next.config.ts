import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, { isServer }) {
    // Add a rule for handling .hbs files using handlebars-loader
    config.module.rules.push({
      test: /\.hbs$/,                // Match .hbs files
      use: 'handlebars-loader',      // Use handlebars-loader to handle .hbs files
    });

    // If necessary, add .hbs to the list of file extensions Webpack should resolve
    config.resolve.extensions.push('.hbs');

    return config;  // Return the modified Webpack configuration
  },
};

export default nextConfig;
