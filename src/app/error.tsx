'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button/Button'
import { IconBtn } from '@/components/ui/button/IconBtn'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <IconBtn className="h-16 w-16">
        <TriangleAlert className="text-icon-secondary h-8 w-8" strokeWidth={1.5} />
      </IconBtn>

      <p className="text-text-primary text-base font-semibold">문제가 생겼어요</p>
      <p className="text-text-tertiary text-sm">
        잠시 후 다시 시도해 주세요
        <br />
        계속 이러면 잠시 뒤에 다시 들러 주세요
      </p>

      <div className="mt-2 flex gap-2">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          leftIcon={<RotateCcw className="h-4 w-4" />}
          className="w-auto"
          onClick={reset}
        >
          다시 시도
        </Button>
        <Link href="/map">
          <Button variant="outlined" size="lg" className="w-auto">
            지도로 가기
          </Button>
        </Link>
      </div>

      {/* 문의가 들어왔을 때 서버 로그와 대조할 수 있는 유일한 단서라 노출해 둔다. */}
      {error.digest && <p className="text-text-tertiary mt-4 text-xs">오류 코드 {error.digest}</p>}
    </div>
  )
}
