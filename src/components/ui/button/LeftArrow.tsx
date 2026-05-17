'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LeftArrow() {
  const router = useRouter()
  return (
    <Image
      src={'../icons/LeftArrow.svg'}
      alt="왼쪽 화살표"
      className="h-6 w-6 cursor-pointer"
      width={24}
      height={24}
      onClick={() => router.back()}
    />
  )
}
