/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/IQOSILUMAV2',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iqosilumai.com',
        pathname: '/**'
      }
    ]
  },
  trailingSlash: true
}

module.exports = nextConfig 