// 인증 쿠키는 백엔드(AWS) 도메인에 SameSite=None 으로 심겨 프런트(Vercel) 도메인으로는 오지 않는다.
// 그래서 프런트 도메인에 "로그인한 것으로 보인다"는 마커 쿠키를 따로 심어 미들웨어 라우팅에만 쓴다.
// 보안 경계가 아니다 — 실제 검증은 백엔드가 401 로 한다. 비밀값이 아니므로 Secure 는 붙이지 않는다(로컬 http 개발 대응).

export const AUTH_MARKER = 'peakda_auth'
export const RETURN_TO = 'peakda_return_to'
export const AUTH_MARKER_SET_EVENT = 'peakda:auth-marker-set'

const MARKER_MAX_AGE = 2592000 // 30일
const RETURN_TO_MAX_AGE = 600 // 10분

export function setAuthMarker(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_MARKER}=1; path=/; max-age=${MARKER_MAX_AGE}; samesite=lax`
  window.dispatchEvent(new Event(AUTH_MARKER_SET_EVENT))
}

export function hasAuthMarker(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((cookie) => cookie === `${AUTH_MARKER}=1`)
}

export function clearAuthMarker(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_MARKER}=; path=/; max-age=0; samesite=lax`
}

export function setReturnTo(path: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${RETURN_TO}=${encodeURIComponent(path)}; path=/; max-age=${RETURN_TO_MAX_AGE}; samesite=lax`
}

// 읽고 즉시 삭제하는 one-shot. 오픈 리다이렉트 방지를 위해 같은 오리진의 절대 경로만 통과시킨다.
export function takeReturnTo(): string | null {
  if (typeof document === 'undefined') return null

  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${RETURN_TO}=`))
    ?.slice(RETURN_TO.length + 1)

  document.cookie = `${RETURN_TO}=; path=/; max-age=0; samesite=lax`

  if (!raw) return null

  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return null
  }

  // '//evil.com' 은 브라우저가 프로토콜 상대 URL 로 해석해 외부로 나간다 — 반드시 막는다.
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null

  return decoded
}
