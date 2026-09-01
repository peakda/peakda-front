'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { NativeAuthManager } from '@/app/_components/NativeAuthManager'
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
      <NativeAuthManager />
      <PushNotificationManager />
      {children}
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  )
}
