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
      // 카카오 기본 프로필/리사이즈 이미지
      { protocol: 'https', hostname: 'img1.kakaocdn.net' },
      { protocol: 'https', hostname: 't1.kakaocdn.net' },
      // 네이버 소셜 로그인 프로필
      { protocol: 'https', hostname: 'phinf.pstatic.net' },
      // 백엔드 S3 미디어 (스팟 기록 사진 등, presigned URL)
      { protocol: 'https', hostname: 'peakda-dev-media-421438965126.s3.ap-northeast-2.amazonaws.com' },
      { protocol: 'https', hostname: 'peakda-prod-media-421438965126.s3.ap-northeast-2.amazonaws.com' },
      // 한국관광공사 TourAPI 이미지 (명소 대표 이미지, 축제 썸네일)
      // firstimage 가 http 로 내려오는 경우가 있어 두 스킴을 모두 허용한다.
      // next/image 가 서버에서 받아 최적화하므로 브라우저에는 https 로만 나가 mixed content 가 아니다.
      { protocol: 'https', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'http', hostname: 'tong.visitkorea.or.kr' },
      // twemoji 이모지 SVG (리액션 바텀시트)
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
}

export default nextConfig
