import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { useFeedListInfinite } from './feed'
import { useExploreSpotsInfinite } from './explore'
import { feedListApi } from './feed-list'
import { exploreSpotsApi } from './explore-spots'

vi.mock('@/hooks/useIsLoggedIn', () => ({ useIsLoggedIn: () => false }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('./feed-list', () => ({ feedListApi: vi.fn() }))
vi.mock('./explore-spots', () => ({ exploreSpotsApi: vi.fn() }))

afterEach(() => {
  focusManager.setFocused(undefined)
  vi.clearAllMocks()
})

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20))
  })

it.each(['feed', 'explore'] as const)(
  '%s: 포커스 복귀는 재조회하지 않고 명시적 무효화는 모든 페이지를 갱신한다',
  async (surface) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const key =
      surface === 'feed'
        ? ['/api/feed', 'infinite', 'ALL']
        : ['/api/explore/spots', 'infinite', 'PEAK_NOW', null]
    const page = { content: [], page: 0, size: 20, totalElements: 40, totalPages: 2, hasNext: true }
    client.setQueryData(
      key,
      { pages: [page, { ...page, page: 1, hasNext: false }], pageParams: [0, 1] },
      { updatedAt: 1 }
    )
    const api = surface === 'feed' ? vi.mocked(feedListApi) : vi.mocked(exploreSpotsApi)
    api.mockImplementation(async (params) => ({ ...page, page: params.pageRequest?.page ?? 0 }))
    function Feed() {
      useFeedListInfinite('ALL')
      return null
    }
    function Explore() {
      useExploreSpotsInfinite('PEAK_NOW')
      return null
    }
    const root = createRoot(document.createElement('div'))
    try {
      await act(async () =>
        root.render(h(QueryClientProvider, { client }, h(surface === 'feed' ? Feed : Explore)))
      )
      await flush()
      // 마운트 시 stale 데이터는 갱신한다. 이후 강제로 오래된 시각으로 만들어 포커스를 검사한다.
      api.mockClear()
      client.setQueryData(key, client.getQueryData(key), { updatedAt: 1 })
      focusManager.setFocused(false)
      focusManager.setFocused(true)
      await flush()
      expect(api).not.toHaveBeenCalled()
      await act(async () => {
        await client.invalidateQueries({ queryKey: key })
      })
      expect(api).toHaveBeenCalledTimes(2)
      for (const call of api.mock.calls) expect(call[1]?.signal).toBeInstanceOf(AbortSignal)
    } finally {
      await act(async () => root.unmount())
      client.clear()
    }
  }
)
