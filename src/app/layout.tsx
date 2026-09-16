import type { Metadata, Viewport } from 'next'
import { Advent_Pro } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Providers } from '@/app/_components/Providers'
import {
  BASE_OPEN_GRAPH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/constants/site'

// Pretendard 는 next/font/local 을 쓰지 않는다 — 통짜 woff2 가 2MB 라 한 글자만 써도 전부 받는다.
// globals.css 가 unicode-range 로 쪼갠 dynamic subset 을 import 하고,
// --font-pretendard 도 거기서 정의한다.

const adventPro = Advent_Pro({
  subsets: ['latin'],
  variable: '--font-advent-pro',
  display: 'swap',
})

// GA4 측정 ID. 페이지 HTML 에 공개되는 값이라 비밀이 아니다.
// 로컬·프리뷰 접속이 통계에 섞이지 않도록 Vercel 운영(Production) 배포에서만 태그를 넣는다.
const GA_MEASUREMENT_ID = 'G-S4E3S38N32'
const isProductionDeploy = process.env.VERCEL_ENV === 'production'

// canonical 은 여기서 정하지 않는다 — 전역에 두면 모든 페이지가 루트를 canonical 로 가리킨다. 페이지별로 둔다.
// 기본 공유 이미지는 app/opengraph-image.tsx 가 자동으로 붙는다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: '%s | Peakda',
  },
  description: SITE_DESCRIPTION,
  keywords: ['벚꽃', '단풍', '꽃구경', '계절여행', '개화시기', '피크다'],
  icons: {
    icon: '/icons/favicon-32.png',
    shortcut: '/icons/favicon-32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
  // 검색엔진 소유 확인. 페이지 HTML 에 공개되는 값이라 비밀이 아니다.
  // 네이버 서치어드바이저는 https://www.peakda.com 으로 등록했다 (구글은 Route 53 DNS TXT 로 확인).
  verification: {
    other: { 'naver-site-verification': '6a10777ffdd994d5c943c8f8c43fbc6008c8a6cb' },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={adventPro.variable}>
      <head>
        {/* DNS 미리 해석 */}
        <link rel="dns-prefetch" href="//dapi.kakao.com" />
        <link rel="dns-prefetch" href="//t1.daumcdn.net" />
        <link rel="dns-prefetch" href="//map1.daumcdn.net" />
        <link rel="dns-prefetch" href="//map2.daumcdn.net" />
        <link rel="dns-prefetch" href="//map3.daumcdn.net" />
        <link rel="dns-prefetch" href="//map4.daumcdn.net" />

        {/* TCP + TLS 핸드셰이크까지 미리 */}
        <link rel="preconnect" href="//dapi.kakao.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="//t1.daumcdn.net" crossOrigin="anonymous" />
      </head>
      <body vaul-drawer-wrapper="" className="bg-gray-100" suppressHydrationWarning>
        <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-[#FFFFFF]">
          <Providers>
            <main className="flex flex-1 flex-col">{children}</main>
          </Providers>
        </div>
        {isProductionDeploy && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  )
}
