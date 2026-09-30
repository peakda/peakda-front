import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, createElement as h, useSyncExternalStore } from 'react'
import { renderToString } from 'react-dom/server'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, focusManager, useQuery } from '@tanstack/react-query'
import { DEFAULT_STALE_TIME, useSsrInitialQuery } from './useSsrInitialQuery'

// 실제 useIsLoggedIn 처럼 서버·하이드레이션 첫 렌더는 false, 그 뒤 실제 값.
let loggedIn = true
vi.mock('@/hooks/useIsLoggedIn', () => ({
  useIsLoggedIn: () =>
    useSyncExternalStore(
      () => () => {},
      () => loggedIn,
      () => false
    ),
}))

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const INITIAL = { v: 'ssr' }
const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 20))
  })

// SSR HTML 을 만든 뒤 하이드레이션하고, 같은 캐시로 다른 화면에서 다시 마운트·창 포커스까지 거친다.
async function scenario() {
  let calls = 0
  const queryFn = async () => {
    calls++
    return { v: 'fresh' }
  }
  function Comp() {
    const ssr = useSsrInitialQuery<{ v: string }>((data) => data === INITIAL)
    const { data } = useQuery({ queryKey: ['k'], queryFn, initialData: INITIAL, ...ssr })
    return h('p', null, data.v)
  }
  const makeClient = () =>
    new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_STALE_TIME, retry: false } } })
  const tree = (client: QueryClient) => h(QueryClientProvider, { client }, h(Comp))

  const container = document.createElement('div')
  container.innerHTML = renderToString(tree(makeClient()))
  const client = makeClient()
  await act(async () => {
    hydrateRoot(container, tree(client))
  })
  await flush()
  const afterHydrate = { calls, text: container.textContent }

  await act(async () => {
    createRoot(document.createElement('div')).render(tree(client))
  })
  await flush()
  const afterRemount = calls

  await act(async () => {
    focusManager.setFocused(false)
    focusManager.setFocused(true)
  })
  await flush()
  focusManager.setFocused(undefined)

  return { afterHydrate, afterRemount, afterFocus: calls }
}

describe('useSsrInitialQuery', () => {
  beforeEach(() => {
    loggedIn = true
  })

  it('로그인 사용자는 하이드레이션 직후 한 번만 다시 조회하고, 재마운트·포커스로는 재요청하지 않는다', async () => {
    const r = await scenario()
    expect(r.afterHydrate).toEqual({ calls: 1, text: 'fresh' })
    expect(r.afterRemount).toBe(1)
    expect(r.afterFocus).toBe(1)
  })

  it('비로그인 사용자는 서버 초기값을 그대로 쓴다', async () => {
    loggedIn = false
    const r = await scenario()
    expect(r.afterHydrate).toEqual({ calls: 0, text: 'ssr' })
    expect(r.afterFocus).toBe(0)
  })
})
