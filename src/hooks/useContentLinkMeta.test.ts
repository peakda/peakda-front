import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { useContentLinkMeta } from './useContentLinkMeta'

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }))
afterEach(() => vi.unstubAllGlobals())

it('화면 밖에서는 요청하지 않고 활성화 후 한 번 조회해 캐시를 재사용한다', async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ title: 'video' }) }))
  vi.stubGlobal('fetch', fetch)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const root = createRoot(document.createElement('div'))
  function Card({ enabled }: { enabled: boolean }) {
    const { meta } = useContentLinkMeta('https://youtube.com/watch?v=test', 'YOUTUBE', enabled)
    return h('span', null, meta?.title)
  }
  const render = async (enabled: boolean) => {
    await act(async () => root.render(h(QueryClientProvider, { client }, h(Card, { enabled }))))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
  }
  try {
    await render(false)
    expect(fetch).not.toHaveBeenCalled()
    await render(true)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]).toHaveLength(2)
    await render(false)
    await render(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  } finally {
    await act(async () => root.unmount())
    client.clear()
  }
})
