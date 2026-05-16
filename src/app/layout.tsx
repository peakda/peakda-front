import type { Metadata } from 'next'
import { Advent_Pro } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/_components/Providers'

const adventPro = Advent_Pro({
  subsets: ['latin'],
  variable: '--font-advent-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Peakda',
  description: '계절 여행 타이밍 안내 서비스',
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
        <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-[#FFFFFF] sm:max-w-107.5">
          <Providers>
            <main className="flex flex-1 flex-col">{children}</main>
          </Providers>
        </div>
      </body>
    </html>
  )
}
