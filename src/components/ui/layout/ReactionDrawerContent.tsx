'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useMyReactionKeys, useReactionEmojiCatalog } from '@/api/facades/feed'
import { EMOJI_GROUPS, REACTIONS } from '@/constants/reaction'
import { cn } from '@/lib/utils/cn'
import { groupPickerEmojis, toTwemojiUrl } from '@/lib/utils/emoji'
import type { ReactionEmoji } from '@/lib/utils/feed'
import type { ReactionData } from '@/stores/useDrawerStore'

interface EmojiGridProps {
  emojis: (ReactionEmoji & { label?: string })[]
  selected: ReadonlySet<string>
  onPick: (emoji: ReactionEmoji, isSelected: boolean) => void
  className?: string
}

function EmojiGrid({ emojis, selected, onPick, className }: EmojiGridProps) {
  return (
    // 시트 높이는 그대로 두고 이 영역만 스크롤한다.
    // data-vaul-no-drag + stopPropagation: 스크롤 제스처가 시트 드래그로 넘어가지 않게 막는다.
    <div
      className={cn(
        'no-scrollbar grid grid-cols-8 content-start gap-1 overflow-y-auto overscroll-contain',
        className
      )}
      data-vaul-no-drag
      onPointerDown={(e) => e.stopPropagation()}
    >
      {emojis.map(({ key, emoji, label }) => (
        <button
          key={key}
          type="button"
          aria-label={label ?? emoji}
          aria-pressed={selected.has(key)}
          onClick={() => onPick({ key, emoji }, selected.has(key))}
          className={cn(
            'flex aspect-square w-full cursor-pointer items-center justify-center rounded-full',
            selected.has(key) && 'bg-green-50'
          )}
        >
          <Image src={toTwemojiUrl(emoji)} alt={label ?? emoji} width={28} height={28} />
        </button>
      ))}
    </div>
  )
}

interface CatalogPickerProps {
  recordId: number
  selected: string[]
  onPick: EmojiGridProps['onPick']
}

// 전체 이모지 피커. 탭을 바꿔도 시트가 출렁이지 않게 본문 높이를 고정한다.
function CatalogPicker({ recordId, selected, onPick }: CatalogPickerProps) {
  const [activeGroup, setActiveGroup] = useState(EMOJI_GROUPS[0].group)
  const { data: catalog, isLoading, refetch } = useReactionEmojiCatalog()
  const { data: myKeys } = useMyReactionKeys(recordId)
  const groups = useMemo(() => groupPickerEmojis(catalog?.items ?? []), [catalog])
  const selectedKeys = useMemo(() => new Set([...selected, ...(myKeys ?? [])]), [selected, myKeys])

  return (
    <>
      <div
        className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5"
        data-vaul-no-drag
        onPointerDown={(e) => e.stopPropagation()}
      >
        {EMOJI_GROUPS.map(({ group, label }) => (
          <button
            key={group}
            type="button"
            aria-pressed={activeGroup === group}
            onClick={() => setActiveGroup(group)}
            className={cn(
              'shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium',
              activeGroup === group ? 'bg-gray-900 text-gray-0' : 'text-text-secondary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {catalog ? (
        <EmojiGrid
          emojis={groups.get(activeGroup) ?? []}
          selected={selectedKeys}
          onPick={onPick}
          className="h-[45vh]"
        />
      ) : (
        <div className="flex h-[45vh] flex-col items-center justify-center gap-3">
          <p className="text-text-tertiary text-sm">
            {isLoading ? '불러오는 중...' : '이모지를 불러오지 못했어요'}
          </p>
          {!isLoading && (
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
    </>
  )
}

interface ReactionDrawerContentProps extends ReactionData {
  onClose: () => void
}

export function ReactionDrawerContent({
  recordId,
  scope,
  selected,
  onSelect,
  onClose,
}: ReactionDrawerContentProps) {
  // 고르면 바로 반영하고 시트를 닫는다 (확인 버튼 없음).
  const handlePick = (emoji: ReactionEmoji, isSelected: boolean) => {
    onSelect(emoji, isSelected ? 'remove' : 'add')
    onClose()
  }

  return (
    <div className="flex flex-col gap-3 px-5 pt-2 pb-8">
      <h2 className="text-text-primary text-lg font-bold">반응 추가</h2>
      {/* 스팟 기록 응답은 ❤️·😀 만 알려줘서, 다른 이모지를 남기면 새로고침 후 이 화면에서 사라진다. */}
      {scope === 'legacy' ? (
        <EmojiGrid
          emojis={REACTIONS}
          selected={new Set(selected)}
          onPick={handlePick}
          className="max-h-[45vh]"
        />
      ) : (
        <CatalogPicker recordId={recordId} selected={selected} onPick={handlePick} />
      )}
    </div>
  )
}
