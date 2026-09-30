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
    // -m-3 p-3: 보이는 크기(24px)와 레이아웃은 그대로 두고 터치 영역만 48px 로 넓힌다.
    <button
      type="button"
      aria-label="뒤로 가기"
      className="-m-3 flex cursor-pointer p-3"
      onClick={() => (href ? router.push(href) : router.back())}
    >
      <Image src="/icons/LeftArrow.svg" alt="" className="h-6 w-6" width={24} height={24} />
    </button>
  )
}
