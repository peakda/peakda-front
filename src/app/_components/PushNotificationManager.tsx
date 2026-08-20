'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_MARKER_SET_EVENT, hasAuthMarker } from '@/lib/auth/session'
import { APP_SETTINGS_CHANGED_EVENT, loadAppSettings } from '@/lib/utils/appSettings'
import { startPushNotifications } from '@/lib/push/pushNotifications'

export function PushNotificationManager() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const start = () => {
      if (!hasAuthMarker() || !loadAppSettings().pushEnabled) return

      void startPushNotifications({
        onNotificationReceived: () => {
          void queryClient.invalidateQueries({
            predicate: (query) =>
              typeof query.queryKey[0] === 'string' &&
              query.queryKey[0].startsWith('/api/notifications'),
          })
        },
        // payload 규격 확정 전에는 임의 필드를 해석하지 않고 알림 목록으로만 이동한다.
        onNotificationAction: () => router.push('/notification'),
      }).catch((error: unknown) => console.error('푸시 알림 초기화 실패', error))
    }

    start()
    window.addEventListener(AUTH_MARKER_SET_EVENT, start)
    window.addEventListener(APP_SETTINGS_CHANGED_EVENT, start)
    return () => {
      window.removeEventListener(AUTH_MARKER_SET_EVENT, start)
      window.removeEventListener(APP_SETTINGS_CHANGED_EVENT, start)
    }
  }, [queryClient, router])

  return null
}
