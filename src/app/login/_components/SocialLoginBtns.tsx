'use client'
import { Button } from '@/components/ui/button/Button'
import { handleAppleLogin, isAppleLoginAvailable } from '@/lib/auth/appleLogin'
import { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } from '@/lib/auth/socialLogin'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

export function SocialLoginBtns() {
  const router = useRouter()
  // 서버 렌더링(웹과 같은 HTML)에는 없고, 하이드레이션 뒤 iOS 앱에서만 보인다.
  const showApple = useSyncExternalStore(noopSubscribe, isAppleLoginAvailable, () => false)

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
      {showApple && (
        <Button
          onClick={() => handleAppleLogin(() => router.replace('/Terms'))}
          size="lg"
          className="rounded-3xl bg-black text-white hover:bg-black"
          variant="filled"
          leftIcon={<Image src="/images/Apple.png" alt="Apple 로고" width={24} height={24} />}
        >
          Apple로 계속하기
        </Button>
      )}
      <Button
        onClick={handleGoogleLogin}
        size="lg"
        variant="filled"
        className="rounded-3xl border border-[#DADCE0] bg-white pr-10 text-[#3C4043] hover:bg-[#F8F9FA]"
        leftIcon={
          <Image
            src="/images/Google.svg"
            alt="구글 로고"
            width={28}
            height={28}
            className="ml-1.5"
          />
        }
      >
        구글로 계속하기
      </Button>
      <Button
        onClick={handleKakaoLogin}
        size="lg"
        className="rounded-3xl bg-[#FEE500] text-black hover:bg-[#FEE500]"
        variant="filled"
        leftIcon={<Image src="/images/Kakao.png" alt="카카오 로고" width={24} height={24} />}
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
