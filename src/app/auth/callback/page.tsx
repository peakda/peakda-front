'use client'

import { getGetCurrentUserUrl } from '@/api/facades/generated/auth/auth'
import MainMessage from '@/components/ui/message/MainMessage'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // ?좉퇋 ?좎???signup-token 留??덉뼱 /auth/me 媛 401 ?대떎.
    // customInstance(useCurrentUser)??401 ??refresh ?ㅽ뙣 ??/login ?쇰줈 ?뺢꺼 媛???뚮줈?곗뿉 ?꾨떖?섏? 紐삵븯誘濡?
    // 肄쒕갚?먯꽌???명꽣?됲꽣瑜??고쉶??吏곸젒 fetch ?섍퀬 ?묐떟?쇰줈 湲곗〈(/map)쨌?좉퇋(/Terms)瑜?遺꾧린?쒕떎.
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
