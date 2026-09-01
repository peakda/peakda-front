'use client'
import { Button } from '@/components/ui/button/Button'
import { handleGoogleLogin } from '@/lib/google/googleLogin'
import { handleKakaoLogin } from '@/lib/kakao/kakaoLogin'
import { handleNaverLogin } from '@/lib/naver/naverLogin'
import Image from 'next/image'

export function SocialLoginBtns() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
      <Button
        onClick={handleGoogleLogin}
        size="lg"
        variant="filled"
        className="border-border-primary rounded-3xl border bg-white text-[#1F1F1F] hover:bg-[#F8F9FA]"
        leftIcon={
          <Image src="/images/Google.svg" alt="구글 로고" width={28} height={28} className="mr-2" />
        }
      >
        구글로 시작하기
      </Button>
      <Button
        onClick={handleKakaoLogin}
        size="lg"
        className="rounded-3xl bg-[#FEE500] text-black hover:bg-[#FEE500]"
        variant="filled"
        leftIcon={<Image src="/images/Kakao.png" alt="애플 로고" width={24} height={24} />}
      >
        카카오로 시작하기
      </Button>
      <Button
        onClick={handleNaverLogin}
        size="lg"
        className="rounded-3xl bg-[#03A94D] text-white hover:bg-[#03A94D]"
        variant="filled"
        leftIcon={<Image src="/images/Naver.png" alt="네이버 로고" width={24} height={24} />}
      >
        네이버로 시작하기
      </Button>
    </div>
  )
}
