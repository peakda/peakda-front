import { useMutation } from '@tanstack/react-query'
import { customInstance } from '@/api/mutator'

// POST /api/launch-alerts 는 dev swagger 에 아직 없어 orval 생성 코드 없이 직접 호출한다 (peakda-server#170).
// swagger 에 생기면 pnpm generate:api 후 생성 함수·타입으로 바꾼다.

export interface SubscribeLaunchAlertRequest {
  platform: 'IOS'
  email: string
  // true 가 아니면 서버가 LAUNCH_ALERT_CONSENT_REQUIRED(400)로 거절한다
  privacyConsent: boolean
}

// 서버 SubscribeLaunchAlertRequest 의 EMAIL_PATTERN 과 같다. 따옴표 local part, =·+·- 로 시작하는 주소를 받지 않는다.
const LAUNCH_ALERT_EMAIL_PATTERN =
  /^[A-Za-z0-9_][A-Za-z0-9._%+-]*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/

export function isValidLaunchAlertEmail(email: string) {
  return email.length <= 254 && LAUNCH_ALERT_EMAIL_PATTERN.test(email)
}

// 로그인 없이 호출한다. 이미 신청한 이메일이어도 같은 201 이 온다. 같은 IP 는 1시간 10회 제한(429).
export async function subscribeLaunchAlertApi(payload: SubscribeLaunchAlertRequest) {
  await customInstance<void>('/api/launch-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// 무효화할 캐시 없음(단발성 신청)
export const useSubscribeLaunchAlert = () => useMutation({ mutationFn: subscribeLaunchAlertApi })
