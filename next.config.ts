import type { NextConfig } from 'next'

// 비로그인에게도 200 으로 열리지만 검색 결과에 나올 가치가 없는 앱 전용 화면.
// robots.txt 로 막으면 크롤러가 이 헤더를 읽지 못하므로 크롤링은 허용하고 noindex 만 붙인다.
const NOINDEX_PATHS = ['/login', '/onboarding', '/search', '/profile', '/my', '/auth/:path*']

const nextConfig: NextConfig = {
  async headers() {
    return NOINDEX_PATHS.map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    }))
  },
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
    // 서버가 용도별 이미지 크기를 제공하므로 Vercel 이미지 변환을 사용하지 않는다.
    unoptimized: true,
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
      {
        protocol: 'https',
        hostname: 'peakda-dev-media-421438965126.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'peakda-prod-media-421438965126.s3.ap-northeast-2.amazonaws.com',
      },
      // 백엔드 이미지 CDN. 서버가 최적화한 크기를 직접 제공한다.
      { protocol: 'https', hostname: 'cdn.peakda.com' },
      { protocol: 'https', hostname: 'cdn-dev.peakda.com' },
      // 한국관광공사 TourAPI 이미지 (명소 대표 이미지, 축제 썸네일)
      // firstimage 가 http 로 내려오는 경우가 있어 두 스킴을 모두 허용한다.
      // 브라우저에서 직접 읽으므로 이미지 표시 시 HTTPS 로 정규화한다.
      { protocol: 'https', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'http', hostname: 'tong.visitkorea.or.kr' },
      // twemoji 이모지 SVG (리액션 바텀시트)
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
}

export default nextConfig
