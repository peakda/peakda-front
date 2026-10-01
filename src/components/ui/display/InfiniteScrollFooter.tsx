import type { RefObject } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button/Button'

interface InfiniteScrollFooterProps {
  sentinelRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
  // 다음 페이지 요청이 실패했을 때만 넘긴다. 실패 후엔 자동 요청을 멈추므로(shouldLoadMore) 버튼으로만 다시 부른다.
  onRetry?: () => void
}

export function InfiniteScrollFooter({
  sentinelRef,
  isLoading,
  onRetry,
}: InfiniteScrollFooterProps) {
  return (
    <div
      ref={sentinelRef}
      className="flex min-h-12 items-center justify-center"
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="text-icon-tertiary h-5 w-5 animate-spin" />
          <span className="sr-only">다음 페이지를 불러오는 중</span>
        </>
      ) : (
        onRetry && (
          <div role="alert" className="flex items-center gap-3 py-3">
            <p className="text-text-tertiary text-sm">더 불러오지 못했어요</p>
            {/* 앱(안드로이드)에서 손가락으로 누르기 쉽도록 md(36px) 대신 높이를 44px 로 둔다. */}
            <Button variant="outlined" color="primary" onClick={onRetry} className="h-11">
              다시 시도
            </Button>
          </div>
        )
      )}
    </div>
  )
}
