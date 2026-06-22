/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/inventory',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/inventory/:path*',
        destination: '/products/:path*',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
