'use client'

import { useEffect, useRef } from 'react'

/**
 * 목록 하단 sentinel 이 뷰포트에 들어오면 onIntersect 를 호출한다.
 * 반환한 ref 를 목록 맨 아래 빈 엘리먼트에 달아 쓴다.
 *
 * enabled 에는 `hasNextPage && !isFetchingNextPage` 를 넘긴다.
 * false 면 관찰 자체를 하지 않아 마지막 페이지에서 추가 요청이 나가지 않는다.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onIntersect: () => void,
  enabled: boolean
) {
  const ref = useRef<T>(null)
  // 호출부가 인라인 화살표 함수를 넘겨도 옵저버가 매 렌더 재생성되지 않도록 최신 콜백만 갈아끼운다.
  const savedCallback = useRef(onIntersect)

  useEffect(() => {
    savedCallback.current = onIntersect
  })

  useEffect(() => {
    const target = ref.current
    if (!target || !enabled) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) savedCallback.current()
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [enabled])

  return ref
}
