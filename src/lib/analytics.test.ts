import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { track } from '@/lib/analytics'

describe('lib/analytics track', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    delete window.gtag
    vi.useRealTimers()
  })

  it('gtag 가 있으면 값 없는 파라미터를 빼고 platform 을 붙여 보낸다', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    track('search', { search_term: '벚꽃', result_count: undefined })

    expect(gtag).toHaveBeenCalledWith('event', 'search', { search_term: '벚꽃', platform: 'web' })
  })

  it('GA 초기화 전에 보낸 이벤트는 gtag 가 생긴 뒤에 보낸다', () => {
    track('spot_view', { spot_id: 1, spot_type: 'ATTRACTION', bloom_status: 'PEAK' })

    const gtag = vi.fn()
    window.gtag = gtag
    vi.advanceTimersByTime(500)

    expect(gtag).toHaveBeenCalledWith('event', 'spot_view', {
      spot_id: 1,
      spot_type: 'ATTRACTION',
      bloom_status: 'PEAK',
      platform: 'web',
    })
  })

  it('gtag 가 끝내 없으면(운영 배포가 아님) 기다리다 버린다', () => {
    track('login', {})
    vi.advanceTimersByTime(60_000)

    expect(vi.getTimerCount()).toBe(0)
  })
})
