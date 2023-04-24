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
  }


}

module.exports = nextConfig






