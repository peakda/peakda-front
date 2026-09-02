'use client'

import { REACTIONS } from '@/constants/reaction'
import { cn } from '@/lib/utils/cn'
import type { ReactionData } from '@/stores/useDrawerStore'

interface ReactionDrawerContentProps extends ReactionData {
  onClose: () => void
}

export function ReactionDrawerContent({ selected, onSelect, onClose }: ReactionDrawerContentProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pt-2 pb-8">
      <h2 className="text-text-primary text-lg font-bold">반응 추가</h2>

      {/* 리액션이 늘어나도 시트 높이는 그대로 두고 이 영역만 스크롤한다.
          data-vaul-no-drag + stopPropagation: 스크롤 제스처가 시트 드래그로 넘어가지 않게 막는다. */}
      <div
        className="no-scrollbar grid max-h-[45vh] grid-cols-8 gap-1 overflow-y-auto overscroll-contain"
        data-vaul-no-drag
        onPointerDown={(e) => e.stopPropagation()}
      >
        {REACTIONS.map(({ type, emoji, label }) => (
          <button
            key={type}
            type="button"
            aria-label={label}
            aria-pressed={selected.includes(type)}
            onClick={() => {
              // 고르면 바로 반영하고 시트를 닫는다 (확인 버튼 없음).
              onSelect(type)
              onClose()
            }}
            className={cn(
              'flex aspect-square w-full cursor-pointer items-center justify-center rounded-full text-2xl leading-none',
              selected.includes(type) && 'bg-green-50'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
