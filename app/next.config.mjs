/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/lnkd-data-hub',
  images: {
    unoptimized: true
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
