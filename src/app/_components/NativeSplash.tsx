'use client'

import { SplashScreen } from '@capacitor/splash-screen'
import { useEffect } from 'react'
import { isNativeAndroid } from '@/lib/auth/nativeAuth'

// 원격 URL(server.url)을 띄우는 구조라 네이티브 스플래시가 시간만 보고 사라지면
// 페이지가 아직 안 그려진 상태에서 흰 화면이 노출된다. 첫 프레임이 그려진 뒤에 직접 내린다.
// capacitor.config 의 launchShowDuration 은 이 호출이 실패해도 앱이 멈추지 않게 하는 상한선이다.
export function NativeSplash() {
  useEffect(() => {
    if (!isNativeAndroid()) return

    let nextFrame = 0

    // rAF 두 번이면 현재 트리가 실제로 한 프레임 그려진 뒤다.
    const firstFrame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        void SplashScreen.hide()
      })
    })

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(nextFrame)
    }
  }, [])

  return null
}
