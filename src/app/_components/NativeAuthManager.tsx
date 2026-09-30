'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getAuthMe } from '@/api/facades/generated/auth/auth'
import { track } from '@/lib/analytics'
import {
  clearNativeAuthSession,
  exchangeNativeAuthorizationCode,
  getNativeAuthSession,
  isNativeAndroid,
} from '@/lib/auth/nativeAuth'
import { setAuthMarker, takeReturnTo } from '@/lib/auth/session'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'
import { toast } from 'sonner'

function codeFromAppUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'peakda:' || url.hostname !== 'auth' || url.pathname !== '/callback') return null
    return url.searchParams.get('code')
  } catch {
    return null
  }
}

// 딥링크로 앱이 새로 뜨면 같은 code 가 appUrlOpen(보관됐다 전달)과 getLaunchUrl 로 두 번 들어오고,
// getLaunchUrl 은 프로세스가 살아 있는 동안 계속 그 URL 을 준다(전체 로드 후에도).
// code 는 일회성이라 두 번째 교환은 실패해 로그인된 채로 로그인 시트가 뜬다. 처리한 code 를 남겨 건너뛴다.
// window.location.replace 뒤에도 남아야 해서 sessionStorage 를 쓴다.
const HANDLED_CODE_KEY = 'peakda:native-auth-handled-code'

function claimCode(code: string): boolean {
  try {
    if (window.sessionStorage.getItem(HANDLED_CODE_KEY) === code) return false
    window.sessionStorage.setItem(HANDLED_CODE_KEY, code)
  } catch {
    // 저장소를 못 쓰면 막지 않는다 — 예전 동작 그대로 교환을 시도한다
  }
  return true
}

export function NativeAuthManager() {
  const router = useRouter()

  useEffect(() => {
    if (!isNativeAndroid()) return

    const handleAppUrl = (url: string) => {
      const code = codeFromAppUrl(url)
      if (!code || !claimCode(code)) return

      void (async () => {
        try {
          const session = await exchangeNativeAuthorizationCode(code)
          await Browser.close()

          // 로그인 바텀시트에서 Custom Tab 을 열었으므로 돌아오면 시트를 닫는다.
          useLoginSheetStore.getState().closeLoginSheet()
          if (session.accessToken) {
            setAuthMarker()
            track('login', {})
            // router.replace 를 쓰면 마커 변경으로 LoginGuard 가 건 router.refresh 가 이 이동에 취소돼
            // 로그인 전 prefetch(/record → /map?login=1)가 남는다. 전체 로드로 라우터 캐시를 확실히 비운다.
            window.location.replace(takeReturnTo() ?? '/map')
          } else {
            router.replace('/Terms')
          }
        } catch (error) {
          console.error('앱 로그인 코드 교환 실패', error)
          toast.error('로그인하지 못했어요. 다시 시도해 주세요.')
          useLoginSheetStore.getState().openLoginSheet()
        }
      })()
    }

    const restoreSession = async () => {
      const session = await getNativeAuthSession()
      if (!session) return

      if (session.signupToken) {
        if (window.location.pathname === '/login') router.replace('/Terms')
        return
      }

      try {
        await getAuthMe()
        setAuthMarker()
        // 로그인 성공 때와 같은 이유로 전체 로드한다
        if (window.location.pathname === '/login') window.location.replace(takeReturnTo() ?? '/map')
      } catch {
        await clearNativeAuthSession()
      }
    }

    const listener = App.addListener('appUrlOpen', ({ url }) => handleAppUrl(url))

    void restoreSession()
    void App.getLaunchUrl().then((launch) => {
      if (launch?.url) handleAppUrl(launch.url)
    })
    return () => {
      void listener.then((handle) => handle.remove())
    }
  }, [router])

  return null
}
