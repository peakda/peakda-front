'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getAuthMe } from '@/api/facades/generated/auth/auth'
import {
  clearNativeAuthSession,
  exchangeNativeAuthorizationCode,
  getNativeAuthSession,
  isNativeAndroid,
} from '@/lib/auth/nativeAuth'
import { setAuthMarker, takeReturnTo } from '@/lib/auth/session'

function codeFromAppUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'peakda:' || url.hostname !== 'auth' || url.pathname !== '/callback') return null
    return url.searchParams.get('code')
  } catch {
    return null
  }
}

export function NativeAuthManager() {
  const router = useRouter()

  useEffect(() => {
    if (!isNativeAndroid()) return

    const handleAppUrl = (url: string) => {
      const code = codeFromAppUrl(url)
      if (!code) return

      void (async () => {
        try {
          const session = await exchangeNativeAuthorizationCode(code)
          await Browser.close()

          if (session.accessToken) {
            setAuthMarker()
            router.replace(takeReturnTo() ?? '/map')
          } else {
            router.replace('/Terms')
          }
        } catch (error) {
          console.error('앱 로그인 코드 교환 실패', error)
          router.replace('/login')
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
        if (window.location.pathname === '/login') router.replace(takeReturnTo() ?? '/map')
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
