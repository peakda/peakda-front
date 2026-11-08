'use client'

import { useAllReactions } from '@/api/facades/feed'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import type { ReactionAllData } from '@/stores/useDrawerStore'

interface ReactionAllDrawerContentProps extends ReactionAllData {
  onClose: () => void
}

// 카드에는 상위 8종만 보여서, 나머지까지 모든 반응을 칩으로 보여주는 시트.
// 서버가 이모지 키 순으로 나눠 주므로 인기순이 아니다. 칩을 누르면 반응 추가 시트처럼 바로 반영하고 닫는다.
export function ReactionAllDrawerContent({
  recordId,
  onSelect,
  onClose,
}: ReactionAllDrawerContentProps) {
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAllReactions(recordId)
  const items = data?.pages.flatMap((page) => page?.items ?? []) ?? []

  return (
    <div className="flex flex-col gap-3 px-5 pt-2 pb-8">
      <h2 className="text-text-primary text-lg font-bold">전체 반응</h2>
      {data ? (
        // data-vaul-no-drag + stopPropagation: 스크롤 제스처가 시트 드래그로 넘어가지 않게 막는다.
        <div
          className="no-scrollbar flex max-h-[45vh] flex-col gap-3 overflow-y-auto overscroll-contain"
          data-vaul-no-drag
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <EmojiBtn
                key={item.key}
                emoji={item.emoji}
                label={`+${item.count}`}
                selected={item.reactedByMe}
                onClick={() => {
                  onSelect(item, item.reactedByMe ? 'remove' : 'add')
                  onClose()
                }}
              />
            ))}
          </div>
          {hasNextPage && (
            <button
              type="button"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
              className="border-border-primary text-text-secondary cursor-pointer self-center rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {isFetchingNextPage ? '불러오는 중...' : '더 불러오기'}
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center gap-3">
          <p className="text-text-tertiary text-sm">
            {isLoading ? '불러오는 중...' : '반응을 불러오지 못했어요'}
          </p>
          {isError && (
            <button
              type="button"
              onClick={() => void refetch()}
              className="border-border-primary text-text-secondary cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  )
}
