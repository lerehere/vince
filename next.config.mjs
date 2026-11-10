/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

 output: 'export',
 basePath: '/vince',      // имя репозитория, нужно для адреса lerehere.github.io/vince
 images: { unoptimized: true },
}

export default nextConfig
