/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9200/:path*'
      },
      {
        source: '/ws',
        destination: 'http://localhost:9200/ws'
      }
    ];
  },
}

module.exports = nextConfig 