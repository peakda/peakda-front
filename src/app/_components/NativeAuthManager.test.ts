import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Android Capacitor 동작을 흉내 낸다 (@capacitor/android 8.5 소스 기준).
// - getLaunchUrl: Bridge.intentUri 는 액티비티 생성 때 한 번 정해져 프로세스가 사는 동안 같은 값을 준다
// - appUrlOpen: 콜드 스타트 때 리스너 없이 발생해 보관됐다가 첫 리스너 등록 때 한 번 전달된다
const CALLBACK = 'peakda://auth/callback?code=ONE_TIME'
const native = vi.hoisted(() => ({
  launchUrl: null as string | null,
  retained: null as string | null,
  usedCodes: new Set<string>(),
}))

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (_: string, cb: (e: { url: string }) => void) => {
      const url = native.retained
      native.retained = null
      if (url) queueMicrotask(() => cb({ url }))
      return Promise.resolve({ remove: () => {} })
    },
    getLaunchUrl: () => Promise.resolve(native.launchUrl ? { url: native.launchUrl } : undefined),
  },
}))
vi.mock('@capacitor/browser', () => ({ Browser: { close: () => Promise.resolve() } }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/api/facades/generated/auth/auth', () => ({ getAuthMe: () => Promise.resolve() }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))
// 서버의 로그인 code 는 일회성이다 — 같은 code 의 두 번째 교환은 실패한다.
vi.mock('@/lib/auth/nativeAuth', () => ({
  isNativeAndroid: () => true,
  getNativeAuthSession: () => Promise.resolve(null),
  clearNativeAuthSession: () => Promise.resolve(),
  exchangeNativeAuthorizationCode: vi.fn((code: string) => {
    if (native.usedCodes.has(code)) return Promise.reject(new Error('invalid code'))
    native.usedCodes.add(code)
    return Promise.resolve({ accessToken: 'access', refreshToken: 'refresh' })
  }),
}))

import { NativeAuthManager } from '@/app/_components/NativeAuthManager'
import { exchangeNativeAuthorizationCode } from '@/lib/auth/nativeAuth'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

// 로그인 성공 후 window.location.replace 로 전체 로드되는 것을 언마운트 → 재마운트로 흉내 낸다.
async function mountPage() {
  const root = createRoot(document.createElement('div'))
  await act(async () => {
    root.render(createElement(NativeAuthManager))
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  return root
}

describe('NativeAuthManager', () => {
  beforeEach(() => {
    native.usedCodes.clear()
    window.sessionStorage.clear()
    vi.mocked(exchangeNativeAuthorizationCode).mockClear()
    useLoginSheetStore.setState({ isOpen: false })
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/map', replace: vi.fn() },
      configurable: true,
    })
  })

  it('딥링크로 앱이 새로 떠도 같은 code 는 한 번만 교환하고 로그인 시트를 열지 않는다', async () => {
    native.launchUrl = CALLBACK
    native.retained = CALLBACK

    const first = await mountPage()
    expect(window.location.replace).toHaveBeenCalledWith('/map')
    first.unmount()

    // /map 전체 로드 — getLaunchUrl 은 여전히 같은 콜백 URL 을 준다
    await mountPage()

    expect(exchangeNativeAuthorizationCode).toHaveBeenCalledTimes(1)
    expect(useLoginSheetStore.getState().isOpen).toBe(false)
  })

  it('새 code 로 다시 로그인하면 정상적으로 교환한다', async () => {
    native.launchUrl = null
    native.retained = CALLBACK
    ;(await mountPage()).unmount()

    native.retained = 'peakda://auth/callback?code=SECOND'
    await mountPage()

    expect(exchangeNativeAuthorizationCode).toHaveBeenCalledTimes(2)
    expect(useLoginSheetStore.getState().isOpen).toBe(false)
  })
})
