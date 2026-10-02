'use client'

import { useEffect, useRef } from 'react'

// 모바일 한 화면 절반 정도. 피드 아이템 1~2개 높이라 스크롤 중에 다음 페이지가 이어서 붙는다.
const PRELOAD_MARGIN = '0px 0px 400px 0px'

/**
 * 목록 하단 sentinel 이 뷰포트에 들어오면 onIntersect 를 호출한다.
 * 반환한 ref 를 목록 맨 아래 빈 엘리먼트에 달아 쓴다.
 *
 * enabled 에는 `shouldLoadMore(hasNextPage, isFetchingNextPage, isFetchNextPageError)` 를 넘긴다.
 * false 면 관찰 자체를 하지 않아 마지막 페이지나 실패 후에 추가 요청이 나가지 않는다.
 *
 * 하단에 닿기 전에 미리 불러오도록 뷰포트 아래 PRELOAD_MARGIN 만큼 앞서 감지한다.
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) savedCallback.current()
      },
      { rootMargin: PRELOAD_MARGIN }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [enabled])

  return ref
}
