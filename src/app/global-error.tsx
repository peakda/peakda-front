'use client'

import { useEffect } from 'react'
import './globals.css'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * 루트 레이아웃 자체가 터졌을 때만 뜬다. 레이아웃을 대체하므로 html·body 를 직접 그린다.
 *
 * 여기서는 공용 컴포넌트를 쓰지 않는다 — 레이아웃이 무너진 상황이라 의존을 더 얹지 않는 편이
 * 안전하다. 같은 이유로 next/font 도 없어 Pretendard 가 아닌 기본 글꼴로 렌더된다.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body className="bg-gray-100">
        <div className="relative mx-auto flex min-h-dvh w-full flex-col items-center justify-center gap-2 bg-white px-4 py-8 text-center sm:max-w-107.5">
          <div className="bg-bg-secondary border-border-primary flex h-16 w-16 items-center justify-center rounded-full border">
            <span aria-hidden className="text-2xl">
              🌧️
            </span>
          </div>

          <p className="text-text-primary text-base font-semibold">잠시 문제가 생겼어요</p>
          <p className="text-text-tertiary text-sm">
            앱을 다시 불러올게요
            <br />
            계속 이러면 잠시 뒤에 다시 들러 주세요
          </p>

          <button
            type="button"
            onClick={reset}
            className="bg-brand-secondary mt-2 h-12 cursor-pointer rounded-3xl px-6 text-[15px] font-medium text-white"
          >
            다시 시도
          </button>

          {error.digest && (
            <p className="text-text-tertiary mt-4 text-xs">오류 코드 {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  )
}
