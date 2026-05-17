'use client'
import Button from '@/components/ui/button/Button'
import { handleKakaoLogin } from '@/lib/kakao/kakaoLogin'
import Image from 'next/image'

export default function SocialLoginBtns() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
      <Button
        size="lg"
        variant="filled"
        className="bg-[#000000] text-white hover:bg-[#000000]"
        leftIcon={<Image src="/images/Apple.png" alt="애플 로고" width={20} height={20} />}
      >
        애플 로그인
      </Button>
      <Button
        onClick={handleKakaoLogin}
        size="lg"
        className="bg-[#FEE500] text-black hover:bg-[#FEE500]"
        variant="filled"
        leftIcon={<Image src="/images/Kakao.png" alt="애플 로고" width={20} height={20} />}
      >
        카카오 로그인
      </Button>
      <Button
        size="lg"
        className="bg-[#03A94D] text-white hover:bg-[#03A94D]"
        variant="filled"
        leftIcon={<Image src="/images/Naver.png" alt="애플 로고" width={20} height={20} />}
      >
        네이버 로그인
      </Button>
    </div>
  )
}
