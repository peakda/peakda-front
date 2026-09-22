'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { LoginGuard } from '@/components/auth/LoginGuard'
import { LoginSheet } from '@/components/auth/LoginSheet'
import { AuthCacheReset } from '@/app/_components/AuthCacheReset'
import { NativeAuthManager } from '@/app/_components/NativeAuthManager'
import { NativeBackButton } from '@/app/_components/NativeBackButton'
import { NativeSplash } from '@/app/_components/NativeSplash'
import { PushNotificationManager } from '@/app/_components/PushNotificationManager'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분. 실시간성 필요한 쿼리만 개별 오버라이드
            retry: 1,
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
      {children}
      <LoginGuard />
      <LoginSheet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  )
}
