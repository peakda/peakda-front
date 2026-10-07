'use client'

import { useSyncExternalStore } from 'react'

interface TimeAgoTextProps {
  text: string
  className?: string
}

const noopSubscribe = () => () => {}

// '3분 전' 같은 상대 시간은 렌더 시각에 따라 달라진다. 피드는 ISR 캐시 HTML 이라 서버 문구와
// 하이드레이션 때 문구가 어긋나기 쉬운데, 한 글자만 달라도 React 가 Suspense 경계 안 DOM 을
// 통째로 버리고 다시 만든다. 하이드레이션 동안엔 서버 글자를 그대로 두고(suppressHydrationWarning),
// 끝나면 key 를 바꿔 이 span 만 지금 시각 기준으로 다시 그린다.
export function TimeAgoText({ text, className }: TimeAgoTextProps) {
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return (
    <span key={isHydrated ? 'client' : 'server'} suppressHydrationWarning className={className}>
      {text}
    </span>
  )
}
