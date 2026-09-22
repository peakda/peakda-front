'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { markNotificationReadApi } from '@/api/facades/notification'
import { track } from '@/lib/analytics'
import { AUTH_MARKER_CHANGED_EVENT, hasAuthMarker } from '@/lib/auth/session'
import { APP_SETTINGS_CHANGED_EVENT, loadAppSettings } from '@/lib/utils/appSettings'
import { startPushNotifications } from '@/lib/push/pushNotifications'
import { resolvePushNotificationTarget } from '@/lib/utils/notificationToAlarm'

export function PushNotificationManager() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const invalidateNotifications = () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/api/notifications'),
      })

    const start = () => {
      if (!hasAuthMarker() || !loadAppSettings().pushEnabled) return

      void startPushNotifications({
        onNotificationReceived: () => {
          void invalidateNotifications()
        },
        onNotificationAction: (action) => {
          const { notificationId, type, link } = resolvePushNotificationTarget(
            action.notification.data
          )
          // 발송 수는 GA 가 모르므로 클릭률은 백엔드 발송 수와 나눠 본다.
          track('push_open', { notification_type: type ?? undefined })

          if (notificationId != null) {
            markNotificationReadApi(notificationId)
              .then(() => invalidateNotifications())
              .catch((error: unknown) => console.error('푸시 알림 읽음 처리 실패', error))
          }

          if (!link) {
            router.push('/notification')
            return
          }
          if (link.isExternal) window.open(link.href, '_blank', 'noopener,noreferrer')
          else router.push(link.href)
        },
      }).catch((error: unknown) => console.error('푸시 알림 초기화 실패', error))
    }

    start()
    window.addEventListener(AUTH_MARKER_CHANGED_EVENT, start)
    window.addEventListener(APP_SETTINGS_CHANGED_EVENT, start)
    return () => {
      window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, start)
      window.removeEventListener(APP_SETTINGS_CHANGED_EVENT, start)
    }
  }, [queryClient, router])

  return null
}
