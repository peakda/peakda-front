'use client'

import { Badge } from '@/components/ui/display/Badge'
import Button from '@/components/ui/button/Button'
import Header from '@/components/ui/layout/Header'
import InputFiled from '@/components/ui/form/InputFiled'
import { useCheckNickname } from '@/hooks/useCheckNickname'
import { cn } from '@/lib/utils/cn'
import { useUploadThing } from '@/lib/uploadthing'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { useSignUpComplete } from '@/hooks/useSignUpComplete'
import LeftArrow from '@/components/ui/button/LeftArrow'

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
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isAvailable, isPending, check, isError, message } = useCheckNickname(nickname)
  const { startUpload, isUploading } = useUploadThing('profileImage', {
    onClientUploadComplete: (res) => {
      setProfileImageUrl(res[0].ufsUrl)
    },
  })
  const { isPending: signupPending, check: submit } = useSignUpComplete(nickname, profileImageUrl)

  const toggleBadge = useCallback((flower: string) => {
    setSelected((prev) =>
      prev.includes(flower) ? prev.filter((f) => f !== flower) : [...prev, flower]
    )
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    startUpload([file])
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
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
      <div className="relative flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = ''
            fileInputRef.current?.click()
          }}
          className="relative cursor-pointer"
          disabled={isUploading}
        >
          <Image
            src={preview ?? '/images/Profile.png'}
            alt="프로필 이미지"
            width={100}
            height={100}
            className="object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
              <span className="text-xs text-white">업로드 중...</span>
            </div>
          )}
        </button>
        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="bg-brand-secondary absolute right-10 bottom-0 cursor-pointer rounded-xl px-2 py-1 text-white"
          >
            초기화
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
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
          isError={isError}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1">
          <h3 className="text-[16px] font-semibold tracking-tight text-gray-700">
            어떤 꽃·자연이 좋으세요?
          </h3>
          <p className="text-gray-500">(복수 선택)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FLOWER_LIST.map((flower) => {
            const isSelected = selected.includes(flower)
            return (
              <Badge
                key={flower}
                label={flower}
                variant="ghost"
                color="gray"
                className={cn(
                  'cursor-pointer rounded-xl px-3.5 py-2',
                  isSelected && 'border-brand-secondary text-text-secondary bg-green-50'
                )}
                onClick={() => toggleBadge(flower)}
              />
            )
          })}
        </div>
      </div>
      <div className="fixed right-0 bottom-2 left-0 z-10 mx-auto max-w-107.5 px-4">
        <Button
          variant="filled"
          size="lg"
          className="w-full cursor-pointer bg-[#98C96D] text-white hover:bg-[#98C96D]"
          disabled={isUploading || signupPending}
          onClick={() => submit()}
        >
          PEAKDA 시작하기
        </Button>
      </div>
    </div>
  )
}
