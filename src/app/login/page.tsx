import type { Metadata } from 'next'
import MainMessage from '@/components/ui/message/MainMessage'
import SocialLoginBtns from './_components/SocialLoginBtns'

export const metadata: Metadata = {
  title: '로그인',
  description: '소셜 로그인으로 피크다를 시작하세요.',
}

export default function LoginPage() {
  return (
    <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center gap-10 px-4 pt-20">
      <div className="flex flex-2 items-center justify-center">
        <MainMessage />
      </div>
      <SocialLoginBtns />
    </div>
  )
}
