'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_MARKER_CHANGED_EVENT, hasAuthMarker } from '@/lib/auth/session'

// 로그인/로그아웃/탈퇴/세션 만료로 사용자가 바뀌면 이전 계정의 응답이 캐시에 그대로 남는다.
// 파사드의 `enabled: isLoggedIn` 은 요청만 막을 뿐 이미 있는 캐시 데이터는 계속 반환하므로,
// 로그아웃 후 /my 에 다시 들어가면 전 계정의 닉네임·통계·기록이 보인다. 마커가 바뀌는 순간 캐시를 비운다.
//
// 값이 그대로인 알림은 무시한다. 앱은 시작할 때 NativeAuthManager 가 이미 있는 마커를 다시 심는데,
// 이때 비우면 진행 중인 조회(지도 핀·검색 문구 등)가 취소되고 화면이 다시 렌더될 때까지 다시 불러오지 않는다
// (위치 권한을 거부해 지도가 움직이지 않으면 핀이 계속 비어 있었다). LoginGuard 와 같은 기준이다.
export function AuthCacheReset() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let prev = hasAuthMarker()
    const reset = () => {
      const next = hasAuthMarker()
      if (next === prev) return
      prev = next
      queryClient.clear()
    }
    window.addEventListener(AUTH_MARKER_CHANGED_EVENT, reset)
    return () => window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, reset)
  }, [queryClient])

  return null
}
