import Link from 'next/link'
import { Compass, MapPinOff } from 'lucide-react'
import { Button } from '@/components/ui/button/Button'
import { IconBtn } from '@/components/ui/button/IconBtn'

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <IconBtn className="h-16 w-16">
        <MapPinOff className="text-icon-secondary h-8 w-8" strokeWidth={1.5} />
      </IconBtn>

      <p className="text-text-primary text-base font-semibold">페이지를 찾을 수 없어요</p>
      <p className="text-text-tertiary text-sm">
        주소가 바뀌었거나 삭제된 페이지예요
        <br />
        지도에서 다른 명소를 둘러보세요
      </p>

      <Link href="/map">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          leftIcon={<Compass className="h-4 w-4" />}
          className="mt-2"
        >
          지도로 가기
        </Button>
      </Link>
    </div>
  )
}
