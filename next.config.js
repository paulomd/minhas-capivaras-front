/** @type {import('next').NextConfig} */
const nextConfig = {
  // API do backend Quarkus (evitar conflito em produção)
  async rewrites() {
    return [
      { source: '/api/backend/:path*', destination: 'http://localhost:8090/:path*' },
    ];
  },
};

module.exports = nextConfig;
