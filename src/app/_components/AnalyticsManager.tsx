'use client'

import { App } from '@capacitor/app'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useCurrentUser } from '@/api/facades/auth'
import { useIsPageLoaded } from '@/hooks/useIsPageLoaded'
import {
  identifyUser,
  initMixpanel,
  isAppReopen,
  setAppVersion,
  syncAuthState,
  track,
  trackPageView,
} from '@/lib/analytics'
import { isNativeAndroid } from '@/lib/auth/nativeAuth'
import { AUTH_MARKER_CHANGED_EVENT } from '@/lib/auth/session'

// Mixpanel 초기화, 페이지뷰, 로그인 사용자 식별, 앱 재방문을 맡는다.
// 토큰이 없는 환경(로컬·프리뷰)에서는 analytics 쪽에서 모두 아무것도 하지 않는다.
export function AnalyticsManager() {
  const pathname = usePathname()
  const { data: user } = useCurrentUser()
  const isPageLoaded = useIsPageLoaded()

  // SDK(약 130KB)는 페이지 load 뒤에 받는다. 하이드레이션 직후 받으면 /map 에서 지도 타일과 대역폭을 다퉜다.
  // 그 전 이벤트는 analytics 쪽에 쌓였다가 초기화 후 나간다. 대가: load 전에 떠난 방문은 Mixpanel 에 남지 않는다.
  useEffect(() => {
    if (isPageLoaded) void initMixpanel()
  }, [isPageLoaded])

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  // 관심 꽃을 바꾸면 회원 정보가 다시 오므로 그때도 갱신된다.
  useEffect(() => {
    if (user) identifyUser(user)
  }, [user])

  useEffect(() => {
    window.addEventListener(AUTH_MARKER_CHANGED_EVENT, syncAuthState)
    return () => window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, syncAuthState)
  }, [])

  // 백그라운드에서 다시 열면 화면 이동이 없어 페이지뷰가 안 생긴다. 보기만 하고 닫은 재방문도 잡기 위해 따로 보낸다.
  useEffect(() => {
    if (!isNativeAndroid()) return

    App.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch((error) => console.warn('앱 버전 조회 실패', error))

    let pausedAt: number | null = null
    const pauseListener = App.addListener('pause', () => {
      pausedAt = Date.now()
    })
    const resumeListener = App.addListener('resume', () => {
      if (isAppReopen(pausedAt, Date.now())) track('app_open', {})
      pausedAt = null
    })

    return () => {
      void pauseListener.then((handle) => handle.remove())
      void resumeListener.then((handle) => handle.remove())
    }
  }, [])

  return null
}
