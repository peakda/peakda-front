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
        className="rounded-3xl bg-[#000000] text-white hover:bg-[#000000]"
        leftIcon={<Image src="/images/Apple.png" alt="애플 로고" width={28} height={28} />}
      >
        애플로 시작하기
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
        size="lg"
        className="rounded-3xl bg-[#03A94D] text-white hover:bg-[#03A94D]"
        variant="filled"
        leftIcon={<Image src="/images/Naver.png" alt="애플 로고" width={24} height={24} />}
      >
        네이버로 시작하기
      </Button>
    </div>
  )
}
