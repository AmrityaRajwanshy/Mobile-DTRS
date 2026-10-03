/** @type {import('next').NextConfig} */
const backendBaseUrl = (
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/live_tracking/:path*',
        destination: `${backendBaseUrl}/api/railradar/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

