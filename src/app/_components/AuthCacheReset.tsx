'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_MARKER_CHANGED_EVENT } from '@/lib/auth/session'

// 로그인/로그아웃/탈퇴/세션 만료로 사용자가 바뀌면 이전 계정의 응답이 캐시에 그대로 남는다.
// 파사드의 `enabled: isLoggedIn` 은 요청만 막을 뿐 이미 있는 캐시 데이터는 계속 반환하므로,
// 로그아웃 후 /my 에 다시 들어가면 전 계정의 닉네임·통계·기록이 보인다. 마커가 바뀌는 순간 캐시를 비운다.
export function AuthCacheReset() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const reset = () => queryClient.clear()
    window.addEventListener(AUTH_MARKER_CHANGED_EVENT, reset)
    return () => window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, reset)
  }, [queryClient])

  return null
}
