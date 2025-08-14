/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:8090'}/api/inventory/:path*`,
      },
    ];
  },
};

export default nextConfig;
