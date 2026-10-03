import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isAppReopen, track } from '@/lib/analytics'

const mixpanel = vi.hoisted(() => ({
  init: vi.fn(),
  register: vi.fn(),
  track: vi.fn(),
  track_pageview: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  people: { set: vi.fn(), set_once: vi.fn(), union: vi.fn() },
}))

vi.mock('mixpanel-browser', () => ({ default: mixpanel }))

// 토큰은 모듈을 읽을 때 정해지므로 테스트마다 새로 불러온다.
async function loadAnalytics(token: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_MIXPANEL_TOKEN', token)
  return import('@/lib/analytics')
}

describe('lib/analytics Mixpanel', () => {
  beforeEach(() => {
    window.gtag = vi.fn()
  })

  afterEach(() => {
    delete window.gtag
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('토큰이 없으면(로컬·프리뷰) SDK 를 받지도, 보내지도 않는다', async () => {
    const analytics = await loadAnalytics('')

    analytics.track('spot_view', { spot_id: 1, spot_type: 'ATTRACTION' })
    await analytics.initMixpanel()

    expect(mixpanel.init).not.toHaveBeenCalled()
    expect(mixpanel.track).not.toHaveBeenCalled()
    expect(window.gtag).toHaveBeenCalledWith('event', 'spot_view', {
      spot_id: 1,
      spot_type: 'ATTRACTION',
      platform: 'web',
    })
  })

  it('초기화 전에 생긴 호출은 공통 속성을 등록한 뒤 순서대로 보낸다', async () => {
    const analytics = await loadAnalytics('token')

    analytics.track('spot_save', { spot_id: 3 })
    analytics.trackPageView('/map')
    await analytics.initMixpanel()

    expect(mixpanel.init).toHaveBeenCalledWith('token', {
      track_pageview: false,
      autocapture: false,
    })
    expect(mixpanel.register).toHaveBeenCalledWith({ platform: 'web', is_logged_in: false })
    expect(mixpanel.track).toHaveBeenCalledWith('Spot Saved', { spot_id: 3 })
    expect(mixpanel.register.mock.invocationCallOrder[0]).toBeLessThan(
      mixpanel.track.mock.invocationCallOrder[0]
    )
    expect(mixpanel.track.mock.invocationCallOrder[0]).toBeLessThan(
      mixpanel.track_pageview.mock.invocationCallOrder[0]
    )
  })

  it('GA 전용 이벤트(web_vitals)는 Mixpanel 에 보내지 않는다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.track('web_vitals', {
      metric_name: 'LCP',
      metric_value: 1200,
      metric_rating: 'good',
      metric_id: 'v1',
    })

    expect(mixpanel.track).not.toHaveBeenCalled()
  })

  it('페이지뷰는 경로가 바뀔 때만 보내고, 두 번째 화면부터 직전 경로를 붙인다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.trackPageView('/map')
    analytics.trackPageView('/map')
    analytics.trackPageView('/spot/1')

    expect(mixpanel.track_pageview).toHaveBeenCalledTimes(2)
    expect(mixpanel.register).toHaveBeenCalledWith({ prev_path: '/map' })
    expect(mixpanel.register).not.toHaveBeenCalledWith({ prev_path: null })
  })

  it('가입 직후 식별할 때만 가입일·가입 플랫폼을 남긴다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.markSignedUp()
    analytics.identifyUser({ id: 7, favoriteCategories: ['CHERRY_BLOSSOM'] })
    analytics.identifyUser({ id: 7, favoriteCategories: ['CHERRY_BLOSSOM'] })

    expect(mixpanel.identify).toHaveBeenCalledWith('7')
    expect(mixpanel.people.set).toHaveBeenCalledWith({ interest_flowers: ['CHERRY_BLOSSOM'] })
    expect(mixpanel.people.union).toHaveBeenCalledWith('platforms_used', ['web'])
    expect(mixpanel.people.set_once).toHaveBeenCalledTimes(1)
    expect(mixpanel.people.set_once).toHaveBeenCalledWith({
      signup_date: expect.any(String),
      signup_platform: 'web',
    })
  })

  it('인증 마커가 사라지면 새 익명 사용자로 바꾸고 공통 속성을 다시 등록한다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()
    analytics.setAppVersion('1.2.0')

    analytics.syncAuthState()

    expect(mixpanel.reset).toHaveBeenCalledOnce()
    expect(mixpanel.register).toHaveBeenLastCalledWith({
      platform: 'web',
      app_version: '1.2.0',
      is_logged_in: false,
    })
  })

  it('인증 마커가 생기면 로그인 상태만 갱신한다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()
    document.cookie = 'peakda_auth=1; path=/'

    analytics.syncAuthState()

    expect(mixpanel.reset).not.toHaveBeenCalled()
    expect(mixpanel.register).toHaveBeenLastCalledWith({ is_logged_in: true })
    document.cookie = 'peakda_auth=; path=/; max-age=0'
  })
})

describe('lib/analytics isAppReopen', () => {
  const now = 1_000_000_000

  it('백그라운드에 30분 이상 있다가 돌아와야 재방문으로 본다', () => {
    expect(isAppReopen(null, now)).toBe(false)
    expect(isAppReopen(now - 29 * 60 * 1000, now)).toBe(false)
    expect(isAppReopen(now - 30 * 60 * 1000, now)).toBe(true)
  })
})

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
