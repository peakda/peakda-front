import { Capacitor } from '@capacitor/core'
import type { AutocaptureConfig, OverridedMixpanel } from 'mixpanel-browser'
import { hasAuthMarker } from '@/lib/auth/session'
import { readStorage, removeStorage, writeStorage } from '@/lib/utils/storage'

export type SearchTrigger = 'typed' | 'hot' | 'recent'
export type FilterSurface = 'map' | 'explore'
export type LocationPermission = 'granted' | 'denied'
export type ExploreSection = 'peak_now' | 'next_week' | 'festival' | 'creator'
export type SpotAction = 'save' | 'unsave' | 'alert_on' | 'alert_off' | 'record'
export type RecordLocationMethod = 'typed' | 'search' | 'from_spot'
// 기록 작성 중 마지막으로 한 행동. 등록하지 않고 나갈 때(record_abandon) 어디서 멈췄는지 본다.
export type RecordAction =
  | 'start'
  | 'photo_picker_open'
  | 'photo_add'
  | 'photo_remove'
  | 'location_search_open'
  | 'location_search_close'
  | 'place_select'
  | 'location_type'
  | 'category'
  | 'date'
  | 'step1_next'
  | 'back_to_step1'
  | 'plant'
  | 'bloom_stage'
  | 'memo'
  | 'submit'

// GA4·Mixpanel 로 보내는 이벤트 이름과 파라미터는 여기서만 정한다 — 화면마다 문자열을 쓰면 오타 하나로 데이터가 갈라진다.
// 이벤트 목록과 각 이벤트가 언제 기록되는지는 docs/ANALYTICS_EVENTS.md 에 둔다.
// 파라미터로 나눠 보려면 GA 관리 → 맞춤 정의에 측정기준으로 등록해야 한다 (등록 전에 쌓인 데이터에는 적용 안 됨).
// 어느 화면에서 일어났는지는 GA 가 page_location 으로 자동으로 붙이므로 따로 보내지 않는다.
interface AnalyticsEvents {
  // provider: 로그인 버튼을 누를 때 저장해 둔 값(google/kakao/naver). 다른 경로로 왔으면 없다.
  login: { provider?: string }
  login_click: { provider: string }
  sign_up: { provider?: string }
  onboarding_step: { step: number }
  onboarding_skip: { step: number }
  logout: Record<string, never>
  account_delete: Record<string, never>
  location_setting_change: { enabled: boolean }
  // trigger: 검색어를 직접 쳤는지, 인기 검색어·최근 검색어를 눌렀는지
  search: { search_term: string; result_count?: number; trigger: SearchTrigger }
  search_result_click: {
    result_type: 'spot' | 'user'
    item_id: number
    position: number
    search_term: string
  }
  search_tab_change: { tab: string; has_keyword: boolean }
  // categories 는 목록이다 — GA 에는 쉼표로 이어 보내고, Mixpanel 에는 꽃별로 셀 수 있게 목록 그대로 보낸다.
  // 지도는 목록 결과가 나온 뒤 result_count(0건 포함)와 함께 보낸다. 탐색 화면은 보여줄 목록이 없어 비운다.
  map_filter_apply: {
    surface: FilterSurface
    region: string
    timing: string
    categories: string[]
    flower_count: number
    result_count?: number
  }
  filter_open: { surface: FilterSurface }
  map_pin_click: { spot_id: number }
  // 핀을 누르면 뜨는 목록에서 몇 번째 카드를 눌러 상세로 갔는지
  map_preview_click: { spot_id: number; position: number }
  // 위치를 쓸 수 있었는지. 앱 설정에서 꺼 두었으면 app_off
  map_my_location_click: { permission: LocationPermission | 'app_off' }
  // 값이 바뀔 때만 보낸다(trackLocationPermission). 이미 허용한 사람이 지도에 올 때마다 쌓이지 않게.
  location_permission: { result: LocationPermission; trigger: 'map_open' | 'my_location_button' }
  explore_card_click: {
    section: ExploreSection
    item_id: number
    position: number
    view: 'main' | 'list'
  }
  explore_see_all: { section: ExploreSection }
  spot_view: {
    spot_id: number
    spot_name: string
    spot_type: string
    bloom_category?: string
    bloom_status?: string
  }
  // 로그인 여부와 상관없이 누른 순간 보낸다. 성공(spot_save 등)과의 차이가 로그인 안내에서 멈춘 사람이다.
  spot_action_click: {
    action: SpotAction
    spot_id: number
  }
  festival_view: { festival_id: number; festival_name: string }
  // 공식 홈페이지 — 서비스 밖으로 나가는 지점
  festival_homepage_click: { festival_id: number }
  spot_save: { spot_id: number }
  spot_unsave: { spot_id: number }
  login_prompt: { reason: string }
  record_start: { spot_id?: number }
  record_create: { spot_id?: number; spot_type: string; bloom_stage?: string; photo_count: number }
  // source: 찜 시트에서 알림을 켠 채로 찜했는지(save_sheet), 이미 찜한 명소에서 종으로 켰는지(toggle)
  bloom_alert_on: { spot_id: number; source: 'save_sheet' | 'toggle' }
  bloom_alert_off: { spot_id: number }
  push_permission: { result: string }
  // 알림으로 어느 스팟에 갔는지는 뒤따르는 spot_view 로 알 수 있어 대상 id 는 보내지 않는다.
  push_open: { notification_type?: string }
  notification_click: { notification_type: string; was_unread: boolean }
  // 안 읽은 알림 점이 보임. 화면을 오갈 때마다 쌓이지 않게 앱(페이지)을 새로 열 때마다 한 번만 보낸다.
  notification_badge_shown: { unread_count: number }
  notification_icon_click: { surface: 'map' | 'my'; has_unread: boolean; unread_count: number }
  notification_tab_change: { tab: string }
  notification_read_all: { unread_count: number }
  feed_view: { record_id: number; spot_id: number }
  feed_tab_change: { tab: string }
  feed_photo_swipe: { record_id: number; photo_count: number; surface: 'feed_list' | 'feed_detail' }
  reaction_add: { record_id: number; reaction_type: string }
  reaction_remove: { record_id: number; reaction_type: string }
  follow: { target_user_id: number }
  unfollow: { target_user_id: number }
  report_submit: { target_type: string }
  record_photo_add: { added: number; photo_count: number }
  record_location_search_open: Record<string, never>
  record_place_select: Record<string, never>
  record_location_select: { method: RecordLocationMethod; photo_count: number }
  record_submit_click: { photo_count: number; plant_count: number }
  // 등록하지 않고 기록 화면을 떠난 순간의 상태. 화면 이동·탭/앱 닫힘에서 한 번만 보낸다.
  record_abandon: {
    screen: 'step1' | 'location_search' | 'step2'
    last_action: RecordAction
    photo_count: number
    has_location: boolean
    has_date: boolean
    plant_count: number
    has_bloom_stage: boolean
    has_memo: boolean
    duration_sec: number
  }
  record_plant_select: { plant_id: number }
  record_edit_start: { record_id: number }
  record_edit: { record_id: number }
  record_delete: { record_id: number }
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
  login_click: 'Login Started',
  sign_up: 'Sign Up Completed',
  onboarding_step: 'Onboarding Step Viewed',
  onboarding_skip: 'Onboarding Skipped',
  logout: 'Logout',
  account_delete: 'Account Deleted',
  location_setting_change: 'Location Setting Changed',
  search: 'Search Performed',
  search_result_click: 'Search Result Clicked',
  search_tab_change: 'Search Tab Changed',
  map_filter_apply: 'Filter Applied',
  filter_open: 'Filter Opened',
  map_pin_click: 'Map Pin Clicked',
  map_preview_click: 'Map Preview Clicked',
  map_my_location_click: 'My Location Clicked',
  location_permission: 'Location Permission Responded',
  explore_card_click: 'Explore Card Clicked',
  explore_see_all: 'Explore See All Clicked',
  spot_view: 'Spot Viewed',
  spot_action_click: 'Spot Action Clicked',
  festival_view: 'Festival Viewed',
  festival_homepage_click: 'Festival Homepage Clicked',
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
  notification_badge_shown: 'Notification Badge Shown',
  notification_icon_click: 'Notification Icon Clicked',
  notification_tab_change: 'Notification Tab Changed',
  notification_read_all: 'Notifications All Read',
  feed_view: 'Feed Viewed',
  feed_tab_change: 'Feed Tab Changed',
  feed_photo_swipe: 'Feed Photos Swiped',
  reaction_add: 'Reaction Added',
  reaction_remove: 'Reaction Removed',
  follow: 'User Followed',
  unfollow: 'User Unfollowed',
  report_submit: 'Report Submitted',
  record_photo_add: 'Record Photo Added',
  record_location_search_open: 'Record Location Search Opened',
  record_place_select: 'Record Place Selected',
  record_location_select: 'Record Location Selected',
  record_submit_click: 'Record Submit Clicked',
  record_abandon: 'Record Abandoned',
  record_plant_select: 'Record Plant Selected',
  record_edit_start: 'Record Edit Started',
  record_edit: 'Record Edited',
  record_delete: 'Record Deleted',
  app_open: 'App Opened',
  web_vitals: null,
}

// Vercel 에서 Production 환경에만 등록한다 — 로컬·프리뷰는 토큰이 없어 아무것도 보내지 않는다.
// 토큰은 페이지에 공개되는 값이라 비밀이 아니다.
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

// 이름 붙인 이벤트 밖의 버튼 클릭은 자동 수집으로 본다. 클릭·연타(rage)·반응 없는 클릭(dead)만 받는다.
// - 입력·스크롤·제출은 무료 한도만 쓰고, 버튼 문구는 닉네임·기록 본문이 섞일 수 있어 받지 않는다.
//   버튼은 aria-label 로 구분한다(기본 수집 속성) — 아이콘만 있는 버튼에는 aria-label 을 붙일 것.
// - 원래 반응이 없는 영역(지도·사진 캐러셀·바텀시트 손잡이)은 'mp-no-track' 클래스로 뺀다. 조상에 붙어도 막힌다.
// - 성수기에 한도가 위험하면 Vercel 에서 NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE=off 로 끈다(재배포 필요).
const AUTOCAPTURE_CONFIG: AutocaptureConfig | false =
  process.env.NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE === 'off'
    ? false
    : {
        pageview: false,
        click: true,
        dead_click: true,
        rage_click: true,
        input: false,
        scroll: false,
        submit: false,
        capture_text_content: false,
      }

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
    mp.init(MIXPANEL_TOKEN, { track_pageview: false, autocapture: AUTOCAPTURE_CONFIG })
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

let isBadgeShownTracked = false

// 지도·마이 상단 알림 버튼에 안 읽은 표시가 처음 보일 때. 이후 버튼을 누르는지(notification_icon_click)와 비교한다.
export function trackNotificationBadgeShown(unreadCount: number) {
  if (isBadgeShownTracked || unreadCount <= 0) return
  isBadgeShownTracked = true
  track('notification_badge_shown', { unread_count: unreadCount })
}

// 소셜 로그인은 외부 화면에 다녀오므로(웹은 전체 이동) 고른 수단을 저장소에 남겨 두고, 로그인·가입 완료 때 꺼낸다.
const LOGIN_PROVIDER_KEY = 'peakda_analytics_login_provider'

export function trackLoginStart(provider: string) {
  writeStorage(LOGIN_PROVIDER_KEY, provider)
  track('login_click', { provider })
}

// 신규 회원은 로그인 콜백에서 꺼내지 않고 약관·가입을 거쳐 sign_up 에서 꺼낸다.
export function takeLoginProvider(): string | undefined {
  const provider = readStorage(LOGIN_PROVIDER_KEY) ?? undefined
  removeStorage(LOGIN_PROVIDER_KEY)
  return provider
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

// 이 기기에서 마지막으로 보낸 위치 권한 결과. 같으면 다시 보내지 않는다.
const LOCATION_PERMISSION_KEY = 'peakda_analytics_location_permission'

export function trackLocationPermission(
  result: LocationPermission,
  trigger: AnalyticsEvents['location_permission']['trigger']
) {
  if (readStorage(LOCATION_PERMISSION_KEY) === result) return
  writeStorage(LOCATION_PERMISSION_KEY, result)
  track('location_permission', { result, trigger })
}

// Activation: 찜·만개 알림·기록 중 하나라도 하면 "관심 장소를 만든 사용자"로 본다.
// Mixpanel 무료 플랜은 여러 이벤트를 하나로 묶는 커스텀 이벤트가 없어, 퍼널에 쓸 대표 이벤트를 함께 보낸다.
// 퍼널: Page Viewed(처음) → Activation Action, 전환 기간 7일 또는 1세션 (docs/ANALYTICS_EVENTS.md)
const ACTIVATION_ACTIONS: Partial<Record<keyof AnalyticsEvents, string>> = {
  spot_save: 'spot_saved',
  bloom_alert_on: 'bloom_alert_enabled',
  record_create: 'record_created',
}

interface TrackOptions {
  // 페이지가 닫히는 순간(pagehide)에 보낼 때. 일반 요청은 닫히면서 취소될 수 있다.
  beacon?: boolean
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  params: AnalyticsEvents[E],
  options: TrackOptions = {}
) {
  if (typeof window === 'undefined') return

  const defined = Object.fromEntries(Object.entries(params).filter(([, value]) => value != null))
  // GA 파라미터는 목록을 받지 않아 쉼표로 잇는다.
  const gaParams = Object.fromEntries(
    Object.entries(defined).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(',') : value,
    ])
  )
  // 앱(Capacitor)도 운영 웹을 그대로 띄우므로 같은 GA 로 들어온다. 웹·앱을 이 값으로 가른다.
  sendWhenReady(['event', event, { ...gaParams, platform: Capacitor.getPlatform() }])

  // platform·is_logged_in·prev_path 는 공통 속성으로 등록돼 있어 Mixpanel 에는 따로 붙이지 않는다.
  const mixpanelName = MIXPANEL_EVENT_NAMES[event]
  if (mixpanelName) {
    withMixpanel((mp) =>
      options.beacon
        ? mp.track(mixpanelName, defined, { transport: 'sendBeacon' })
        : mp.track(mixpanelName, defined)
    )
  }

  const activationAction = ACTIVATION_ACTIONS[event]
  if (activationAction) {
    withMixpanel((mp) => mp.track('Activation Action', { action: activationAction }))
  }
}
