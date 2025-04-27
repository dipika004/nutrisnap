import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,  // Allows TypeScript errors to be ignored during the build
  },
  eslint: {
    ignoreDuringBuilds: true,  // Ignores ESLint errors during the build process
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // Allows loading images from picsum.photos
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
