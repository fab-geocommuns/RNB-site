/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  productionBrowserSourceMaps: true,
  experimental: { appDir: true },
  webpack: config => {

    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource"
    });

    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },


}

module.exports = nextConfig






