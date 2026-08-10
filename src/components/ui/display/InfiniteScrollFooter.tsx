import type { RefObject } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollFooterProps {
  sentinelRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
}

export function InfiniteScrollFooter({ sentinelRef, isLoading }: InfiniteScrollFooterProps) {
  return (
    <div
      ref={sentinelRef}
      className="flex h-12 items-center justify-center"
      aria-busy={isLoading}
    >
      {isLoading && (
        <>
          <Loader2 className="text-icon-tertiary h-5 w-5 animate-spin" />
          <span className="sr-only">다음 페이지를 불러오는 중</span>
        </>
      )}
    </div>
  )
}
