import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**', '**/System Volume Information/**'],
      }
    }
    return config
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    deviceSizes: [390, 430, 768, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      // UploadThing CDN
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      // UploadThing 스토리지 (프로필 이미지 presigned URL)
      { protocol: 'https', hostname: 't3.storageapi.dev' },
      // 카카오 소셜 로그인 프로필
      { protocol: 'https', hostname: 'k.kakaocdn.net' },
      // 네이버 소셜 로그인 프로필
      { protocol: 'https', hostname: 'phinf.pstatic.net' },
    ],
  },
}

export default nextConfig
