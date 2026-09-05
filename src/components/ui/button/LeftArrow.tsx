'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface LeftArrowProps {
  // 지정하면 router.back() 대신 이 경로로 이동한다. 진입 경로가 앱 내 정상 탐색이 아닌
  // 화면(가입 플로우 등)에서 history.back()이 예상 밖의 곳으로 튀는 걸 막기 위함.
  href?: string
}

export function LeftArrow({ href }: LeftArrowProps) {
  const router = useRouter()
  return (
    <Image
      src={'/icons/LeftArrow.svg'}
      alt="왼쪽 화살표"
      className="h-6 w-6 cursor-pointer"
      width={24}
      height={24}
      onClick={() => (href ? router.push(href) : router.back())}
    />
  )
}
