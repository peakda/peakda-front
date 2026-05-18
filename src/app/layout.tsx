import type { Metadata } from 'next'
import { Advent_Pro } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/app/_components/Providers'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '45 920',
})

const adventPro = Advent_Pro({
  subsets: ['latin'],
  variable: '--font-advent-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Peakda | 계절 여행 타이밍',
    template: 'Peakda | %s',
  },
  description: '벚꽃·단풍 등 20여 개 계절 명소의 실시간 개화 상태를 확인하세요.',
  keywords: ['벚꽃', '단풍', '꽃구경', '계절여행', '개화시기', '피크다'],
  icons: {
    icon: '/icons/favicon.svg',
    shortcut: '/icons/favicon.svg',
    apple: '/icons/favicon.svg',
  },
  openGraph: {
    title: 'Peakda | 계절 여행 타이밍',
    description: '벚꽃·단풍 등 20여 개 계절 명소의 실시간 개화 상태를 확인하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${adventPro.variable}`}>
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
        <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-[#FFFFFF] sm:max-w-107.5">
          <Providers>
            <main className="flex flex-1 flex-col">{children}</main>
          </Providers>
        </div>
      </body>
    </html>
  )
}
