import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { useFeedListInfinite } from './feed'
import { useExploreSpotsInfinite } from './explore'
import { feedListApi } from './feed-list'
import { exploreSpotsApi } from './explore-spots'

vi.mock('@/hooks/useIsLoggedIn', () => ({ useIsLoggedIn: () => false }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('./feed-list', () => ({ feedListApi: vi.fn() }))
vi.mock('./explore-spots', () => ({ exploreSpotsApi: vi.fn() }))

afterEach(() => vi.clearAllMocks())

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20))
  })

it.each(['feed', 'explore'] as const)(
  '%s: 명시적 무효화는 모든 페이지를 갱신하고 signal 을 전달한다',
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
      api.mockClear()
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
