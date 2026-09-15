import { useSyncExternalStore } from 'react'
import { AUTH_MARKER_SET_EVENT, hasAuthMarker } from '@/lib/auth/session'

function subscribe(onChange: () => void) {
  window.addEventListener(AUTH_MARKER_SET_EVENT, onChange)
  return () => window.removeEventListener(AUTH_MARKER_SET_EVENT, onChange)
}

// 마커 쿠키 기준 로그인 여부. 보안 판정이 아니라 "로그인 전용 API 를 부를지"를 가르는 용도다.
// 서버 렌더링과 하이드레이션 첫 렌더는 false 로 맞추고, 마운트 직후 실제 값으로 바뀐다.
export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(subscribe, hasAuthMarker, () => false)
}
