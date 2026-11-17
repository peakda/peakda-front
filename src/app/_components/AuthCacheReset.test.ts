import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthCacheReset } from '@/app/_components/AuthCacheReset'
import { clearAuthMarker, setAuthMarker } from '@/lib/auth/session'
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null

async function mount() {
  const queryClient = new QueryClient()
  const clear = vi.spyOn(queryClient, 'clear')
  root = createRoot(document.createElement('div'))
  await act(async () => {
    root?.render(h(QueryClientProvider, { client: queryClient }, h(AuthCacheReset)))
  })
  return clear
}

describe('AuthCacheReset', () => {
  afterEach(() => {
    act(() => root?.unmount())
    root = null
    clearAuthMarker()
  })

  it('로그인·로그아웃으로 마커 값이 바뀌면 캐시를 비운다', async () => {
    const clear = await mount()

    act(() => setAuthMarker())
    expect(clear).toHaveBeenCalledTimes(1)

    act(() => clearAuthMarker())
    expect(clear).toHaveBeenCalledTimes(2)
  })

  it('이미 있는 마커를 다시 심는 알림(앱 시작 때 세션 복원)에는 캐시를 비우지 않는다', async () => {
    setAuthMarker()
    const clear = await mount()

    act(() => setAuthMarker())

    expect(clear).not.toHaveBeenCalled()
  })
})
