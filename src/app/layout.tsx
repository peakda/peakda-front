import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/app/_components/Providers'
import {
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  SITE_URL,
} from '@/constants/site'

// Pretendard 는 next/font/local 을 쓰지 않는다 — 통짜 woff2 가 2MB 라 한 글자만 써도 전부 받는다.
// globals.css 가 unicode-range 로 쪼갠 dynamic subset 을 import 하고,
// --font-pretendard 도 거기서 정의한다.

// GA4 측정 ID. 페이지 HTML 에 공개되는 값이라 비밀이 아니다.
// 로컬·프리뷰 접속이 통계에 섞이지 않도록 Vercel 운영(Production) 배포에서만 태그를 넣는다.
const GA_MEASUREMENT_ID = 'G-S4E3S38N32'
const isProductionDeploy = process.env.VERCEL_ENV === 'production'

// canonical 은 여기서 정하지 않는다 — 전역에 두면 모든 페이지가 루트를 canonical 로 가리킨다. 페이지별로 둔다.
// 기본 공유 이미지는 모든 페이지가 같은 영구 URL 을 쓰도록 명시한다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_BRAND_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  icons: {
    icon: '/icons/favicon-32.png',
    shortcut: '/icons/favicon-32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_BRAND_NAME} — 계절 명소 개화·절정 타이밍` }],
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
  // viewport-fit=cover 를 두지 않는다. 있으면 Capacitor(SystemBars)가 Android 15+·WebView 140+ 에서
  // 상태바·내비게이션바 여백을 네이티브로 잡지 않고 CSS env(safe-area-inset-*) 로 넘겨, 헤더·하단 버튼·
  // 바텀시트가 시스템 바에 가려진다(S25 등). 없으면 네이티브가 WebView 를 두 바 사이에 배치한다.
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* DNS 미리 해석 */}
        <link rel="dns-prefetch" href="//dapi.kakao.com" />
        <link rel="dns-prefetch" href="//t1.kakaocdn.net" />
        {/* TCP + TLS 핸드셰이크까지 미리. SDK와 t1 자원은 crossorigin 없이 요청되므로
            여기에 crossOrigin 을 붙이면 다른 연결로 취급돼 재사용되지 않는다 */}
        <link rel="preconnect" href="//dapi.kakao.com" />
        <link rel="preconnect" href="//t1.kakaocdn.net" />
      </head>
      <body vaul-drawer-wrapper="" className="bg-gray-100" suppressHydrationWarning>
        {/* 앱 화면은 430px 모바일 틀로 감싼다. 반응형인 랜딩 페이지(data-landing)만 틀을 풀고,
            overflow-hidden 이 있으면 sticky 헤더가 붙지 않아 overflow 도 함께 푼다. */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-[#FFFFFF] has-[[data-landing]]:max-w-none has-[[data-landing]]:overflow-visible">
          <Providers>
            <main className="flex flex-1 flex-col">{children}</main>
          </Providers>
        </div>
        {/* GA 본체(gtag.js, br 179KB)는 페이지 로드가 끝난 뒤 받는다. @next/third-parties 의 GoogleAnalytics 는
            본체를 afterInteractive 로 넣어 <head> 에 높은 우선순위 preload 가 붙고, 첫 화면 번들·지도 SDK 와 대역폭을 다퉜다.
            gtag 스텁은 예전처럼 하이드레이션 직후 심으므로 그 사이 이벤트는 dataLayer 에 쌓였다가 본체가 뜨면 나간다.
            대가: 본체가 뜨기 전에 나간 아주 짧은 방문은 GA 에 잡히지 않는다. */}
        {isProductionDeploy && (
          <>
            <Script id="ga-init" strategy="afterInteractive">
              {`window['dataLayer'] = window['dataLayer'] || [];
function gtag(){window['dataLayer'].push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
          </>
        )}
      </body>
    </html>
  )
}
