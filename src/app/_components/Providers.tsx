'use client'

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import * as Sentry from '@sentry/nextjs'
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
import { getApiErrorStatus, shouldRetryQuery } from '@/lib/utils/apiError'
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

// 쿼리가 처리한 에러는 어디에도 던져지지 않아 Sentry 가 못 본다. 서버 실패(5xx)만 직접 보고한다 —
// 4xx·네트워크 끊김은 사용자 쪽 사정이라 노이즈다. onError 는 재시도가 끝난 뒤 한 번만 불린다.
//
// ApiError 는 어느 API 든 메시지(API 500)와 스택(customInstance)이 같아 Sentry 가 이슈 하나로 묶는다.
// 키의 첫 요소(orval 쿼리는 URL, mutation 은 operation 이름)로 API 별 이슈를 나눈다.
// 숫자 id 는 :id 로 접어 같은 API 가 id 마다 다른 이슈로 쪼개지지 않게 한다.
function reportServerError(error: unknown, key: readonly unknown[] | undefined) {
  const status = getApiErrorStatus(error)
  if (status === undefined || status < 500) return

  const head = key?.[0]
  if (typeof head !== 'string') {
    Sentry.captureException(error)
    return
  }
  const endpoint = head.replace(/\/\d+(?=\/|$)/g, '/:id')
  Sentry.captureException(error, {
    fingerprint: ['api-5xx', endpoint],
    tags: { endpoint, status },
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => reportServerError(error, query.queryKey),
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _onMutateResult, mutation) =>
            reportServerError(error, mutation.options.mutationKey),
        }),
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
