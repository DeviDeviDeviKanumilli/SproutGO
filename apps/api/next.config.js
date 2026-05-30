/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages are TS source; let Next transpile them.
  transpilePackages: ["@sproutgo/shared", "@sproutgo/db"],
  experimental: {
    // Prisma must not be bundled into serverless functions.
    serverComponentsExternalPackages: ["@prisma/client", "@sproutgo/db"],
  },
};

module.exports = nextConfig;
