import { Capacitor } from '@capacitor/core'

// GA4 로 보내는 이벤트 이름과 파라미터는 여기서만 정한다 — 화면마다 문자열을 쓰면 오타 하나로 데이터가 갈라진다.
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

export function track<E extends keyof AnalyticsEvents>(event: E, params: AnalyticsEvents[E]) {
  if (typeof window === 'undefined') return

  const defined = Object.fromEntries(Object.entries(params).filter(([, value]) => value != null))
  // 앱(Capacitor)도 운영 웹을 그대로 띄우므로 같은 GA 로 들어온다. 웹·앱을 이 값으로 가른다.
  sendWhenReady(['event', event, { ...defined, platform: Capacitor.getPlatform() }])
}
