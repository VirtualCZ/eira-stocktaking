/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/create/:path*',
        destination: 'http://localhost:8090/create/:path*',
      },
    ];
  },
};

export default nextConfig;
