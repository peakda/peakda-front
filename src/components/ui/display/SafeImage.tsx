'use client'
import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string
}

// 외부(한국관광공사 등) 이미지용. http 주소를 https 로 바꾸고, 로드에 실패하면 아무것도 그리지 않아
// 깨진 이미지 아이콘 대신 부모의 배경색이 보이게 한다.
export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const safeSrc = toHttpsImageUrl(src) ?? src

  if (failedSrc === safeSrc) return null

  return <Image src={safeSrc} alt={alt} onError={() => setFailedSrc(safeSrc)} {...props} />
}
