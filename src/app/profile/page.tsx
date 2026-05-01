import Button from '@/components/ui/Button'
import Header from '@/components/ui/Header'
import InputFiled from '@/components/ui/InputFiled'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  return (
    <div className="relative flex h-screen flex-col">
      <div className="h-14">
        <Header
          left={<ChevronLeft className="cursor-pointer" />}
          center={<div className="text-[15px] font-medium text-[#000000]">프로필 설정</div>}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-xl font-semibold">프로필 설정</h2>
        <p className="text-base font-normal">PEAKDA에서 사용할 정보를 입력해 주세요.</p>
        <p className="text-base font-normal">나중에 MY탭에서 언제든지 변경 가능해요.</p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Image src={'/images/Profile.png'} alt="프로필 이미지" width={100} height={100} />
      </div>
      <div className="flex w-full flex-1 flex-col gap-2 p-4">
        <InputFiled
          title="닉네임"
          showAsterisk
          description="특수문자 제외 2~10자 이내로 작성해주세요."
          placeholder="닉네임을 작성해주세요"
          buttonText="중복확인"
        />
      </div>
      <div className="flex-2 p-4">
        <div className="flex items-center gap-1">
          <h3 className="text-[16px] font-semibold tracking-tight text-gray-700">
            어떤 꽃·자연이 좋으세요?
          </h3>
          <p className="text-gray-500">(복수 선택)</p>
        </div>
      </div>
      <div className="absolute right-0 bottom-4 left-0 z-10 p-4">
        <Button
          variant="filled"
          size="lg"
          className="w-full cursor-pointer bg-[#98C96D] text-white hover:bg-[#98C96D]"
        >
          시작하기
        </Button>
      </div>
    </div>
  )
}
