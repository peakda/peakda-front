'use client'

import { getGetAuthMeUrl } from '@/api/facades/generated/auth/auth'
import { MainMessage } from '@/components/ui/message/MainMessage'
import { track } from '@/lib/analytics'
import { setAuthMarker, takeReturnTo } from '@/lib/auth/session'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // 신규 유저는 signup-token 만 있어 /auth/me 가 401 이다.
    // customInstance(useCurrentUser)는 401 때 refresh 실패 시 /login 으로 튕겨 가입 플로우에 도달하지 못하므로,
    // 콜백에서는 인터셉터를 우회해 직접 fetch 하고 응답으로 기존(/map)·신규(/Terms)를 분기한다.
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${getGetAuthMeUrl()}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          router.replace('/Terms')
          return
        }
        setAuthMarker()
        // 신규 유저는 약관·가입을 마친 뒤 sign_up 으로 따로 잡힌다.
        track('login', {})
        router.replace(takeReturnTo() ?? '/map')
      })
      .catch(() => router.replace('/Terms'))
  }, [router])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500">
      <MainMessage />
    </div>
  )
}
