import type { Metadata } from 'next'
import { Advent_Pro } from 'next/font/google'
import './globals.css'

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
      <body vaul-drawer-wrapper="" className="bg-gray-100" suppressHydrationWarning>
        <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-[#FFFFFF] sm:max-w-107.5">
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  )
}
