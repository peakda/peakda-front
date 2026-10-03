'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from '@/components/ui/sonner'
import { LoginGuard } from '@/components/auth/LoginGuard'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'
import { AnalyticsManager } from '@/app/_components/AnalyticsManager'
import { AuthCacheReset } from '@/app/_components/AuthCacheReset'
import { NativeAuthManager } from '@/app/_components/NativeAuthManager'
import { NativeBackButton } from '@/app/_components/NativeBackButton'
import { NativeSplash } from '@/app/_components/NativeSplash'
import { PushNotificationManager } from '@/app/_components/PushNotificationManager'
import { WebVitalsReporter } from '@/app/_components/WebVitalsReporter'
import { shouldRetryQuery } from '@/lib/utils/apiError'
import { DEFAULT_STALE_TIME } from '@/hooks/useSsrInitialQuery'

// 로그인 시트는 vaul 을 끌고 와 모든 페이지 공통 번들을 키운다. 대부분의 방문에선 열리지 않으므로
// 처음 열릴 때 받아 오고, 한 번 받은 뒤에는 닫힘 애니메이션을 위해 계속 마운트해 둔다.
const LoginSheet = dynamic(
  () => import('@/components/auth/LoginSheet').then((m) => ({ default: m.LoginSheet })),
  { ssr: false }
)

function LazyLoginSheet() {
  const isOpen = useLoginSheetStore((s) => s.isOpen)
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)
  return hasOpened ? <LoginSheet /> : null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: DEFAULT_STALE_TIME, // 5분. 실시간성 필요한 쿼리만 개별 오버라이드
            retry: shouldRetryQuery, // 5xx·네트워크 오류만 1회
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <AuthCacheReset />
      <NativeSplash />
      <NativeBackButton />
      <NativeAuthManager />
      <PushNotificationManager />
      <WebVitalsReporter />
      <AnalyticsManager />
      {children}
      <LoginGuard />
      <LazyLoginSheet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  )
}
