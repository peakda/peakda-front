'use client'

import { Badge } from '@/components/ui/display/Badge'
import Button from '@/components/ui/button/Button'
import Header from '@/components/ui/layout/Header'
import InputFiled from '@/components/ui/form/InputFiled'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { useCheckNickname } from '@/hooks/useCheckNickname'
import { cn } from '@/lib/utils/cn'
import { useCurrentUser } from '@/api/facades/auth'
import { useUploadProfileImage, useDeleteProfileImage } from '@/api/facades/user'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

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

export default function ProfileEditPage() {
  const router = useRouter()
  const { data: user } = useCurrentUser()

  const [nickname, setNickname] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 현재 유저 정보로 초기값 채우기
  useEffect(() => {
    if (!user) return
    setNickname(user.nickname ?? '')
    setPreview(user.profileImageUrl ?? null)
  }, [user])

  const { isAvailable, isPending, check, isError, message } = useCheckNickname(nickname)
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage()
  const { mutate: deleteImage } = useDeleteProfileImage()

  const toggleBadge = useCallback((flower: string) => {
    setSelected((prev) =>
      prev.includes(flower) ? prev.filter((f) => f !== flower) : [...prev, flower]
    )
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    uploadImage(
      { data: { image: file } },
      {
        onSuccess: (res) => {
          const data = res.data.data
          if (data) setPreview(data.profileImageUrl)
        },
      }
    )
  }

  const handleDeleteImage = () => {
    deleteImage()
    setPreview(null)
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-24">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">프로필 편집</div>}
        />
      </div>

      {/* 프로필 이미지 */}
      <div className="relative flex items-center justify-center py-6">
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
            className="h-25 w-25 rounded-full object-cover"
          />
          <span className="bg-brand-secondary absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white">
            <Camera className="h-3.5 w-3.5 text-white" />
          </span>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
              <span className="text-xs text-white">업로드 중...</span>
            </div>
          )}
        </button>
        {preview && (
          <button
            onClick={handleDeleteImage}
            className="text-text-tertiary absolute bottom-0 cursor-pointer text-sm"
          >
            기본 이미지로 변경
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

      {/* 닉네임 */}
      <div className="flex w-full flex-col gap-2 px-4">
        <InputFiled
          title="닉네임"
          showAsterisk
          description="특수문자 제외 2~10자 이내로 작성해주세요."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 작성해주세요"
          buttonText="중복확인"
          maxLength={10}
          onButtonClick={() => check()}
          disabled={nickname.length > 9 || isPending}
          message="닉네임을 작성해주세요"
          error={message}
          isAvailable={isAvailable}
          isError={isError}
        />
      </div>

      {/* 관심 식물 */}
      <div className="flex flex-col gap-2 px-4 pt-6">
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

      {/* 저장 */}
      <div className="fixed right-0 bottom-2 left-0 z-10 mx-auto max-w-107.5 px-4">
        <Button
          variant="filled"
          size="lg"
          color="primary"
          className="w-full"
          disabled={isUploading}
          onClick={() => router.push('/my')}
        >
          저장
        </Button>
      </div>
    </div>
  )
}
