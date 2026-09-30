'use client'

import { getGetAuthMeUrl } from '@/api/facades/generated/auth/auth'
import { track } from '@/lib/analytics'
import { setAuthMarker, takeReturnTo } from '@/lib/auth/session'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

// 로그인 결과 판정·이동만 한다. 화면(로딩 문구)은 서버 컴포넌트인 page 가 그린다.
export function AuthCallbackHandler() {
  const router = useRouter()

  useEffect(() => {
    // 신규 유저는 signup-token 만 있어 /auth/me 가 401 이다.
    // customInstance(useCurrentUser)는 401 때 refresh 실패 시 /login 으로 튕겨 가입 플로우에 도달하지 못하므로,
    // 콜백에서는 인터셉터를 우회해 직접 fetch 하고 응답으로 기존(/map)·신규(/Terms)를 분기한다.
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${getGetAuthMeUrl()}`, { credentials: 'include' })
      .then((res) => {
        // 신규 유저 판정은 4xx 만. 5xx(백엔드 장애·게이트웨이 502)까지 가입으로 보내면
        // 기존 유저가 약관 화면에 갇힌다.
        if (res.status >= 500) throw new Error(`auth/me ${res.status}`)
        if (!res.ok) {
          router.replace('/Terms')
          return
        }
        setAuthMarker()
        // 신규 유저는 약관·가입을 마친 뒤 sign_up 으로 따로 잡힌다.
        track('login', {})
        router.replace(takeReturnTo() ?? '/map')
      })
      .catch((error) => {
        console.error('로그인 확인 실패', error)
        toast.error('로그인 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
        router.replace('/login')
      })
  }, [router])
  return null
}
