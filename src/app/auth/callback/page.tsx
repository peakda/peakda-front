'use client'

import { getGetCurrentUserUrl } from '@/api/generated/auth/auth'
import MainMessage from '@/components/ui/message/MainMessage'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // 신규 유저는 signup-token 만 있어 /auth/me 가 401 이다.
    // customInstance(useCurrentUser)는 401 시 refresh 실패 → /login 으로 튕겨 가입 플로우에 도달하지 못하므로,
    // 콜백에서는 인터셉터를 우회해 직접 fetch 하고 응답으로 기존(/map)·신규(/Terms)를 분기한다.
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${getGetCurrentUserUrl()}`, { credentials: 'include' })
      .then((res) => router.replace(res.ok ? '/map' : '/Terms'))
      .catch(() => router.replace('/Terms'))
  }, [router])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500">
      <MainMessage />
    </div>
  )
}
