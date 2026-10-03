/** @type {import('next').NextConfig} */
const backendBaseUrl = (
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  ''
).replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (backendBaseUrl) {
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
    }
    return [
      {
        source: '/api/live_tracking/:path*',
        destination: '/api/railradar/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
