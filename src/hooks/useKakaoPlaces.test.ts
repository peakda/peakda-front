import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { useKakaoPlaces, type KakaoPlace } from './useKakaoPlaces'

vi.mock('@/lib/kakao/kakaoLoader', () => ({
  kakaoLoader: { load: () => Promise.resolve() },
}))

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type SearchCallback = (data: KakaoPlace[], status: string) => void

// keywordSearch 콜백을 붙잡아 두고, 테스트가 원하는 순서로 응답을 돌려준다.
let pending: Record<string, SearchCallback> = {}
const place = (name: string) => ({ place_name: name }) as KakaoPlace

beforeEach(() => {
  pending = {}
  ;(window as unknown as { kakao: unknown }).kakao = {
    maps: {
      services: {
        Status: { OK: 'OK' },
        Places: class {
          keywordSearch(keyword: string, callback: SearchCallback) {
            pending[keyword] = callback
          }
        },
      },
    },
  }
})

async function renderHook() {
  const result: { current: ReturnType<typeof useKakaoPlaces> | null } = { current: null }
  function Comp() {
    result.current = useKakaoPlaces()
    return null
  }
  await act(async () => {
    createRoot(document.createElement('div')).render(h(Comp))
  })
  return result as { current: ReturnType<typeof useKakaoPlaces> }
}

describe('useKakaoPlaces', () => {
  it('늦게 도착한 이전 검색 응답은 최신 결과를 덮지 않는다', async () => {
    const hook = await renderHook()
    expect(hook.current.isReady).toBe(true)

    act(() => hook.current.search('벚'))
    act(() => hook.current.search('벚꽃'))

    act(() => pending['벚꽃']([place('벚꽃길')], 'OK'))
    act(() => pending['벚']([place('벚나무')], 'OK'))

    expect(hook.current.results.map((p) => p.place_name)).toEqual(['벚꽃길'])
  })

  it('검색어를 지운 뒤 도착한 이전 응답은 버린다', async () => {
    const hook = await renderHook()

    act(() => hook.current.search('공원'))
    act(() => hook.current.search(''))
    act(() => pending['공원']([place('올림픽공원')], 'OK'))

    expect(hook.current.results).toEqual([])
  })
})
