/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/doc',
        destination: 'https://batid.notion.site/Documentation-des-API-du-R-f-rentiel-National-du-B-timent-7b881d168030450f9ed8ed63c9b430a8?pvs=4',
        permanent: true,
      },
    ]
  },
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






