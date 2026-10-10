'use client'
import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { toSmallAvatarUrl } from '@/lib/utils/imageUrl'

interface AvatarImageProps extends Omit<ImageProps, 'src'> {
  src: string
}

// 32~40px 프로필 사진용. 카카오 프로필은 같은 주소의 110px 판으로 받고, 그 주소가 실패하면 원본으로 한 번 되돌린다.
// 56px 이상(유저 화면 헤더·프로필 편집)은 110px 이 모자라 원본을 그대로 쓴다.
export function AvatarImage({ src, alt, ...props }: AvatarImageProps) {
  const smallSrc = toSmallAvatarUrl(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  return (
    <Image
      src={failedSrc === smallSrc ? src : smallSrc}
      alt={alt}
      onError={() => setFailedSrc(smallSrc)}
      {...props}
    />
  )
}
