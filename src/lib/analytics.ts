import { Capacitor } from '@capacitor/core'
import type { OverridedMixpanel } from 'mixpanel-browser'
import { hasAuthMarker } from '@/lib/auth/session'
import { readStorage, removeStorage, writeStorage } from '@/lib/utils/storage'

// GA4·Mixpanel 로 보내는 이벤트 이름과 파라미터는 여기서만 정한다 — 화면마다 문자열을 쓰면 오타 하나로 데이터가 갈라진다.
// 이벤트 목록과 각 이벤트가 언제 기록되는지는 docs/ANALYTICS_EVENTS.md 에 둔다.
// 파라미터로 나눠 보려면 GA 관리 → 맞춤 정의에 측정기준으로 등록해야 한다 (등록 전에 쌓인 데이터에는 적용 안 됨).
// 어느 화면에서 일어났는지는 GA 가 page_location 으로 자동으로 붙이므로 따로 보내지 않는다.
interface AnalyticsEvents {
  login: Record<string, never>
  sign_up: Record<string, never>
  search: { search_term: string; result_count?: number }
  map_filter_apply: { region: string; timing: string; categories: string }
  map_pin_click: { spot_id: number }
  spot_view: { spot_id: number; spot_type: string; bloom_category?: string; bloom_status?: string }
  spot_save: { spot_id: number }
  spot_unsave: { spot_id: number }
  login_prompt: { reason: string }
  record_start: { spot_id?: number }
  record_create: { spot_id?: number; spot_type: string; bloom_stage?: string; photo_count: number }
  bloom_alert_on: { spot_id: number }
  bloom_alert_off: { spot_id: number }
  push_permission: { result: string }
  // 알림으로 어느 스팟에 갔는지는 뒤따르는 spot_view 로 알 수 있어 대상 id 는 보내지 않는다.
  push_open: { notification_type?: string }
  notification_click: { notification_type: string }
  // 앱을 백그라운드에서 다시 연 것. 새로 켠 경우는 페이지뷰가 잡으므로 보내지 않는다.
  app_open: Record<string, never>
  // 실사용자 성능(Core Web Vitals). metric_value 는 ms 단위, CLS 만 1000배 한 정수다(GA value 는 정수 집계).
  // metric_id 로 같은 페이지뷰의 보고를 묶을 수 있고, metric_rating 은 good·needs-improvement·poor.
  web_vitals: {
    metric_name: string
    metric_value: number
    metric_rating: string
    metric_id: string
    navigation_type?: string
  }
}

// GA 초기화 스크립트(layout 의 GoogleAnalytics)는 화면 컴포넌트의 effect 보다 늦게 돈다.
// 첫 화면에서 보낸 이벤트가 사라지지 않게 gtag 가 생길 때까지 잠깐 기다리고,
// 운영 배포가 아니라 끝내 생기지 않으면 버린다.
const RETRY_MS = 500
const MAX_RETRIES = 20

function sendWhenReady(args: unknown[], retries = 0) {
  if (typeof window.gtag === 'function') {
    window.gtag(...args)
    return
  }
  if (retries >= MAX_RETRIES) return
  window.setTimeout(() => sendWhenReady(args, retries + 1), RETRY_MS)
}

// GA4 는 이벤트 이름에 공백을 못 써서 위 키(snake_case)를 그대로 쓰고, Mixpanel 은 사람이 읽는 이름으로 보낸다.
// null 은 GA 에만 보낸다 — 성능 지표는 제품 분석과 무관하고 Mixpanel 무료 한도만 쓴다.
const MIXPANEL_EVENT_NAMES: Record<keyof AnalyticsEvents, string | null> = {
  login: 'Login Completed',
  sign_up: 'Sign Up Completed',
  search: 'Search Performed',
  map_filter_apply: 'Filter Applied',
  map_pin_click: 'Map Pin Clicked',
  spot_view: 'Spot Viewed',
  spot_save: 'Spot Saved',
  spot_unsave: 'Spot Unsaved',
  login_prompt: 'Login Prompt Shown',
  record_start: 'Record Started',
  record_create: 'Record Created',
  bloom_alert_on: 'Bloom Alert Enabled',
  bloom_alert_off: 'Bloom Alert Disabled',
  push_permission: 'Push Permission Responded',
  push_open: 'Push Opened',
  notification_click: 'Notification Clicked',
  app_open: 'App Opened',
  web_vitals: null,
}

// Vercel 에서 Production 환경에만 등록한다 — 로컬·프리뷰는 토큰이 없어 아무것도 보내지 않는다.
// 토큰은 페이지에 공개되는 값이라 비밀이 아니다.
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

// SDK 는 첫 화면이 그려진 뒤 import() 로 받는다. 그 전에 생긴 호출은 순서대로 모아 두었다가 로드 후 실행한다.
let mixpanel: OverridedMixpanel | null = null
let pending: ((mp: OverridedMixpanel) => void)[] = []
let isStarted = false
// SDK 를 끝내 못 받으면(광고 차단 등) 더 모으지 않고 버린다.
let isFailed = false

function withMixpanel(run: (mp: OverridedMixpanel) => void) {
  if (mixpanel) run(mixpanel)
  else if (MIXPANEL_TOKEN && !isFailed && typeof window !== 'undefined') pending.push(run)
}

// reset() 은 공통 속성까지 지우므로 다시 등록할 값을 따로 들고 있는다.
const baseProperties: Record<string, string> = {}

export async function initMixpanel() {
  if (isStarted || !MIXPANEL_TOKEN || typeof window === 'undefined') return
  isStarted = true

  try {
    const { default: mp } = await import('mixpanel-browser')
    // 페이지뷰는 trackPageView 가 직접 보낸다 — 자동 페이지뷰는 prev_path 가 갱신되기 전에 나갈 수 있다.
    mp.init(MIXPANEL_TOKEN, { track_pageview: false, autocapture: false })
    baseProperties.platform = Capacitor.getPlatform()
    mp.register({ ...baseProperties, is_logged_in: hasAuthMarker() })
    mixpanel = mp
    pending.forEach((run) => run(mp))
  } catch (error) {
    isFailed = true
    console.warn('Mixpanel 초기화 실패', error)
  } finally {
    pending = []
  }
}

export function setAppVersion(version: string) {
  baseProperties.app_version = version
  withMixpanel((mp) => mp.register({ app_version: version }))
}

let currentPath: string | null = null

// 경로가 바뀔 때만 부른다. 쿼리(지도 좌표 등)만 바뀐 건 새 화면으로 세지 않는다.
export function trackPageView(path: string) {
  if (path === currentPath) return
  const previousPath = currentPath
  currentPath = path

  withMixpanel((mp) => {
    // 이후 모든 이벤트에 "바로 전 화면"이 붙는다. 첫 화면은 이전 화면이 없다.
    if (previousPath) mp.register({ prev_path: previousPath })
    mp.track_pageview()
  })
}

// 가입 완료 → (회원 정보 조회) → identifyUser 사이에 전체 새로고침이 끼어도 남도록 저장소에 둔다.
const SIGNUP_PENDING_KEY = 'peakda_analytics_signup'

export function markSignedUp() {
  writeStorage(SIGNUP_PENDING_KEY, '1')
}

interface AnalyticsUser {
  id: number
  favoriteCategories: readonly string[]
}

// 이메일·닉네임 같은 개인정보는 보내지 않는다. 회원 번호로만 연결한다.
export function identifyUser(user: AnalyticsUser) {
  const isNewSignup = readStorage(SIGNUP_PENDING_KEY) === '1'
  removeStorage(SIGNUP_PENDING_KEY)

  withMixpanel((mp) => {
    // 로그인 전 익명으로 한 행동도 이 회원으로 합쳐진다.
    mp.identify(String(user.id))
    mp.register({ is_logged_in: true })
    mp.people.set({ interest_flowers: user.favoriteCategories })
    mp.people.union('platforms_used', [baseProperties.platform])
    // 회원 정보에 가입일이 없어 가입 직후에만 남긴다. 기존 회원은 Mixpanel 이 처음 본 날로 대신한다.
    if (isNewSignup) {
      mp.people.set_once({
        signup_date: new Date().toISOString(),
        signup_platform: baseProperties.platform,
      })
    }
  })
}

// 인증 마커가 바뀔 때 부른다. 로그인·로그아웃·탈퇴·세션 만료가 모두 마커를 거친다.
// 마커 변경 이벤트는 setAuthMarker 안에서 바로 발생하므로, 뒤이어 보내는 로그인 이벤트에도 새 값이 붙는다.
export function syncAuthState() {
  if (hasAuthMarker()) {
    withMixpanel((mp) => mp.register({ is_logged_in: true }))
    return
  }
  // 공용 기기에서 다음 사람의 행동이 이전 회원에게 붙지 않게 새 익명 ID 로 바꾼다. reset 은 공통 속성까지 지운다.
  withMixpanel((mp) => {
    mp.reset()
    mp.register({ ...baseProperties, is_logged_in: false })
  })
}

// 앱을 잠깐 다른 앱으로 전환한 것과 다시 방문한 것을 가른다. Mixpanel 이 접속(세션)을 나누는 기본값과 같다.
export const APP_REOPEN_THRESHOLD_MS = 30 * 60 * 1000

export function isAppReopen(pausedAt: number | null, now: number): boolean {
  return pausedAt != null && now - pausedAt >= APP_REOPEN_THRESHOLD_MS
}

export function track<E extends keyof AnalyticsEvents>(event: E, params: AnalyticsEvents[E]) {
  if (typeof window === 'undefined') return

  const defined = Object.fromEntries(Object.entries(params).filter(([, value]) => value != null))
  // 앱(Capacitor)도 운영 웹을 그대로 띄우므로 같은 GA 로 들어온다. 웹·앱을 이 값으로 가른다.
  sendWhenReady(['event', event, { ...defined, platform: Capacitor.getPlatform() }])

  // platform·is_logged_in·prev_path 는 공통 속성으로 등록돼 있어 Mixpanel 에는 따로 붙이지 않는다.
  const mixpanelName = MIXPANEL_EVENT_NAMES[event]
  if (mixpanelName) withMixpanel((mp) => mp.track(mixpanelName, defined))
}
