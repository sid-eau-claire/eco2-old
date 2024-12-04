/** @type {import('next').NextConfig} */
// const nextConfig = {}

// module.exports = nextConfig
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  basePath: "",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: `${process.env.EXTERNAL_STRAPI_HOST}`,
      },
      {
        // Add the new S3 domain to allow images from this source
        hostname: "eaudashboard.s3.ca-west-1.amazonaws.com",
      },
      {
        hostname: "s3-ca-central-1.amazonaws.com",
      }     
    ]
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //       config.externals = config.externals || {};
  //       config.externals['canvas'] = 'commonjs canvas';
  //   }
  //   return config;
  // },  
});
