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

    analytics.track('spot_view', { spot_id: 1, spot_name: '여의도', spot_type: 'ATTRACTION' })
    await analytics.initMixpanel()

    expect(mixpanel.init).not.toHaveBeenCalled()
    expect(mixpanel.track).not.toHaveBeenCalled()
    expect(window.gtag).toHaveBeenCalledWith('event', 'spot_view', {
      spot_id: 1,
      spot_name: '여의도',
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
      autocapture: {
        pageview: false,
        click: true,
        dead_click: true,
        rage_click: true,
        input: false,
        scroll: false,
        submit: false,
        capture_text_content: false,
      },
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

  it('자동 수집 스위치를 끄면(off) 자동 클릭 수집 없이 초기화한다', async () => {
    vi.stubEnv('NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE', 'off')
    const analytics = await loadAnalytics('token')

    await analytics.initMixpanel()

    expect(mixpanel.init).toHaveBeenCalledWith('token', {
      track_pageview: false,
      autocapture: false,
    })
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

describe('lib/analytics trackLocationPermission', () => {
  afterEach(() => {
    delete window.gtag
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('결과가 이전과 같으면 보내지 않고, 바뀌면 보낸다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.trackLocationPermission('granted', 'map_open')
    analytics.trackLocationPermission('granted', 'map_open')
    analytics.trackLocationPermission('denied', 'my_location_button')

    expect(mixpanel.track).toHaveBeenCalledTimes(2)
    expect(mixpanel.track).toHaveBeenNthCalledWith(1, 'Location Permission Responded', {
      result: 'granted',
      trigger: 'map_open',
    })
    expect(mixpanel.track).toHaveBeenNthCalledWith(2, 'Location Permission Responded', {
      result: 'denied',
      trigger: 'my_location_button',
    })
  })

  it('Mixpanel 에는 목록 파라미터를 목록 그대로 보낸다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.track('map_filter_apply', {
      surface: 'explore',
      region: 'all',
      timing: 'all',
      categories: ['CHERRY_BLOSSOM'],
      flower_count: 1,
    })

    expect(mixpanel.track).toHaveBeenCalledWith('Filter Applied', {
      surface: 'explore',
      region: 'all',
      timing: 'all',
      categories: ['CHERRY_BLOSSOM'],
      flower_count: 1,
    })
  })
})

describe('lib/analytics 로그인 수단·알림 표시', () => {
  afterEach(() => {
    delete window.gtag
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('로그인 버튼에서 고른 수단을 완료 때 한 번 꺼내 쓴다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.trackLoginStart('kakao')

    expect(mixpanel.track).toHaveBeenCalledWith('Login Started', { provider: 'kakao' })
    expect(analytics.takeLoginProvider()).toBe('kakao')
    expect(analytics.takeLoginProvider()).toBeUndefined()
  })

  it('안 읽은 알림 표시는 처음 보일 때 한 번만 보내고, 0건이면 보내지 않는다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.trackNotificationBadgeShown(0)
    analytics.trackNotificationBadgeShown(3)
    analytics.trackNotificationBadgeShown(5)

    expect(mixpanel.track).toHaveBeenCalledOnce()
    expect(mixpanel.track).toHaveBeenCalledWith('Notification Badge Shown', { unread_count: 3 })
  })
})

describe('lib/analytics Activation·이탈 전송', () => {
  afterEach(() => {
    delete window.gtag
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('찜·만개 알림·기록 등록 성공에는 Activation Action 을 함께 보내고, 다른 이벤트에는 보내지 않는다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.track('spot_save', { spot_id: 1 })
    analytics.track('bloom_alert_on', { spot_id: 1 })
    analytics.track('record_create', { spot_type: 'LOCAL', photo_count: 1 })
    analytics.track('bloom_alert_off', { spot_id: 1 })
    analytics.track('spot_unsave', { spot_id: 1 })

    const activations = mixpanel.track.mock.calls.filter(([name]) => name === 'Activation Action')
    expect(activations).toEqual([
      ['Activation Action', { action: 'spot_saved' }],
      ['Activation Action', { action: 'bloom_alert_enabled' }],
      ['Activation Action', { action: 'record_created' }],
    ])
  })

  it('beacon 옵션이면 페이지가 닫혀도 보내지도록 sendBeacon 으로 보낸다', async () => {
    const analytics = await loadAnalytics('token')
    await analytics.initMixpanel()

    analytics.track(
      'record_abandon',
      {
        screen: 'location_search',
        last_action: 'location_search_open',
        photo_count: 2,
        has_location: false,
        has_date: true,
        plant_count: 0,
        has_bloom_stage: false,
        has_memo: false,
        duration_sec: 40,
      },
      { beacon: true }
    )

    expect(mixpanel.track).toHaveBeenCalledWith(
      'Record Abandoned',
      expect.objectContaining({ screen: 'location_search', last_action: 'location_search_open' }),
      { transport: 'sendBeacon' }
    )
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

    track('search', { search_term: '벚꽃', result_count: undefined, trigger: 'typed' })

    expect(gtag).toHaveBeenCalledWith('event', 'search', {
      search_term: '벚꽃',
      trigger: 'typed',
      platform: 'web',
    })
  })

  it('GA 초기화 전에 보낸 이벤트는 gtag 가 생긴 뒤에 보낸다', () => {
    track('spot_view', {
      spot_id: 1,
      spot_name: '여의도',
      spot_type: 'ATTRACTION',
      bloom_status: 'PEAK',
    })

    const gtag = vi.fn()
    window.gtag = gtag
    vi.advanceTimersByTime(500)

    expect(gtag).toHaveBeenCalledWith('event', 'spot_view', {
      spot_id: 1,
      spot_name: '여의도',
      spot_type: 'ATTRACTION',
      bloom_status: 'PEAK',
      platform: 'web',
    })
  })

  it('목록 파라미터는 GA 에 쉼표로 이어 보낸다', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    track('map_filter_apply', {
      surface: 'map',
      region: 'all',
      timing: 'all',
      categories: ['CHERRY_BLOSSOM', 'CANOLA'],
      flower_count: 2,
      result_count: 0,
    })

    expect(gtag).toHaveBeenCalledWith('event', 'map_filter_apply', {
      surface: 'map',
      region: 'all',
      timing: 'all',
      categories: 'CHERRY_BLOSSOM,CANOLA',
      flower_count: 2,
      result_count: 0,
      platform: 'web',
    })
  })

  it('gtag 가 끝내 없으면(운영 배포가 아님) 기다리다 버린다', () => {
    track('login', {})
    vi.advanceTimersByTime(60_000)

    expect(vi.getTimerCount()).toBe(0)
  })
})
