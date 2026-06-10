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
  async rewrites() {
    // 브라우저는 same-origin(/api, /oauth2)으로 요청하고, Next 서버가 백엔드로 프록시한다.
    // → 응답 쿠키가 프론트 도메인의 first-party 쿠키로 저장되어 cross-site 쿠키 문제를 회피한다.
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: '/oauth2/:path*',
        destination: `${apiOrigin}/oauth2/:path*`,
      },
    ]
  },
}

export default nextConfig
