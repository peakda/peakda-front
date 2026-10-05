'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from '@/components/ui/layout/Header'
import { useUnreadNotificationCount } from '@/api/facades/notification'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { track, trackNotificationBadgeShown } from '@/lib/analytics'

// 지도 상단 로고 + 알림 버튼. 안 읽은 알림이 있을 때만 알림 버튼에 점을 표시한다.
export function MapHeader() {
  const router = useRouter()
  const { data: unread } = useUnreadNotificationCount()
  const requireLogin = useRequireLogin()
  const unreadCount = unread?.unreadCount ?? 0
  const hasUnreadNotification = unreadCount > 0

  useEffect(() => {
    trackNotificationBadgeShown(unreadCount)
  }, [unreadCount])

  return (
    <Header
      className="mt-2"
      left={
        <div className="flex items-center justify-center gap-2">
          <Image src={'/images/logo.png'} alt="로고" width={36} height={32} className="h-8 w-8.5" />
          <p className="font-advent text-center text-[30px] font-semibold! tracking-tight text-green-700">
            Peakda
          </p>
        </div>
      }
      right={
        <button
          type="button"
          aria-label={hasUnreadNotification ? '알림, 읽지 않은 알림 있음' : '알림'}
          className="bg-bg-primary-80 border-border-primary relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full p-1"
          onClick={() => {
            track('notification_icon_click', {
              surface: 'map',
              has_unread: hasUnreadNotification,
              unread_count: unreadCount,
            })
            requireLogin(() => router.push('/notification'))
          }}
        >
          <Image src={'/icons/alram.svg'} alt="" width={20} height={20} className="h-6 w-6" />
          {hasUnreadNotification && (
            <span className="absolute top-2.5 right-2.5 h-1 w-1 rounded-full bg-pink-500"></span>
          )}
        </button>
      }
    />
  )
}
