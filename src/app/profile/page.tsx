'use client'

import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Header from '@/components/ui/Header'
import InputFiled from '@/components/ui/InputFiled'
import { useCheckNickname } from '@/hooks/useCheckNickname'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const FLOWER_LIST = [
  '동백꽃',
  '매화',
  '개나리',
  '벚꽃',
  '진달래',
  '철쭉',
  '유채꽃',
  '수국',
  '연꽃',
  '코스모스',
  '단풍',
  '핑크뮬리',
  '억새',
]

export default function ProfilePage() {
  const [nickname, setNickname] = useState('')

  const { isAvailable, isPending, check, isError, message } = useCheckNickname(nickname)
  console.log(isAvailable)
  return (
    <div className="relative flex h-screen flex-col">
      <div className="h-14">
        <Header
          left={<ChevronLeft className="cursor-pointer" />}
          center={<div className="text-[15px] font-medium text-[#000000]">프로필 설정</div>}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4">
        <h2 className="text-text-primary text-xl font-semibold">프로필 설정</h2>
        <p className="text-text-secondary text-base font-normal">
          PEAKDA에서 사용할 정보를 입력해 주세요.
        </p>
        <p className="text-text-secondary text-base font-normal">
          나중에 MY탭에서 언제든지 변경 가능해요.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Image src={'/images/Profile.png'} alt="프로필 이미지" width={100} height={100} />
      </div>
      <div className="flex w-full flex-1 flex-col gap-2 p-4">
        <InputFiled
          title="닉네임"
          showAsterisk
          description="특수문자 제외 2~10자 이내로 작성해주세요."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 작성해주세요"
          buttonText="중복확인"
          onButtonClick={() => check()}
          disabled={nickname.length > 9 || isPending}
          message="닉네임을 작성해주세요"
          error={message}
          isAvailable={isAvailable}
        />
      </div>
      <div className="flex flex-2 flex-col gap-2 p-4">
        <div className="flex items-center gap-1">
          <h3 className="text-[16px] font-semibold tracking-tight text-gray-700">
            어떤 꽃·자연이 좋으세요?
          </h3>
          <p className="text-gray-500">(복수 선택)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FLOWER_LIST.map((flower) => (
            <Badge
              key={flower}
              label={flower}
              variant="ghost"
              color="gray"
              className="rounded-xl px-3.5 py-2"
            />
          ))}
        </div>
      </div>
      <div className="absolute right-0 bottom-2 left-0 z-10 p-4">
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
