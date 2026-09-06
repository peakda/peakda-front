'use client'

import { App } from '@capacitor/app'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { isNativeAndroid } from '@/lib/auth/nativeAuth'

// 리스너를 달지 않으면 @capacitor/app 이 뒤로가기를 삼킨 뒤 아무것도 하지 않는다
// (AppPlugin.handleOnBackPressed 는 canGoBack 이 false 일 때 else 가 없다).
// 그래서 첫 화면에서 뒤로가기가 먹통이 된다.
const EXIT_CONFIRM_WINDOW_MS = 2000

export function NativeBackButton() {
  useEffect(() => {
    if (!isNativeAndroid()) return

    let lastPressedAt = 0

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
        return
      }

      const now = Date.now()
      if (now - lastPressedAt < EXIT_CONFIRM_WINDOW_MS) {
        void App.exitApp()
        return
      }

      lastPressedAt = now
      toast('한 번 더 누르면 종료됩니다', { duration: EXIT_CONFIRM_WINDOW_MS })
    })

    return () => {
      void listener.then((handle) => handle.remove())
    }
  }, [])

  return null
}
