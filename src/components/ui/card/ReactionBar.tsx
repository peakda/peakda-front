'use client'

import { useState } from 'react'
import { SmilePlus } from 'lucide-react'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { useAddReaction, useRemoveReaction } from '@/api/facades/feed'
import { reactionToggleAction, toReactionSummary } from '@/lib/utils/feed'
import { cn } from '@/lib/utils/cn'
import type {
  FeedReactionSummaryResponseMyReactionsItem,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

const REACTIONS: { type: FeedReactionSummaryResponseMyReactionsItem; emoji: string }[] = [
  { type: 'HEART', emoji: '❤️' },
  { type: 'SMILE', emoji: '😀' },
]

interface ReactionBarProps {
  recordId: number
  reactions: ReactionSummary
  className?: string
}

// 기록 하나의 리액션 줄. 맨 앞 추가 버튼(+이모지)으로 피커를 열고,
// 남겨진 리액션(내가 누른 것 포함)만 카운트 칩으로 잇는다.
export function ReactionBar({ recordId, reactions, className }: ReactionBarProps) {
  // 조회 응답의 리액션 요약을 그대로 보여주고, 이 화면에서 리액션을 누른 뒤에만
  // mutation 응답으로 덮어쓴다. (useState 초기값으로 두면 나중에 도착한 서버 값이 반영되지 않는다)
  const [reactionOverride, setReactionOverride] = useState<ReactionSummary | null>(null)
  const { counts: reactionCounts, myReactions } = reactionOverride ?? reactions
  const [isPickerOpen, setPickerOpen] = useState(false)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()

  const handleReaction = (type: FeedReactionSummaryResponseMyReactionsItem) => {
    const mutation = reactionToggleAction(myReactions, type) === 'add' ? addReaction : removeReaction
    mutation.mutate(
      { id: recordId, params: { reactionType: type } },
      {
        onSuccess: (res) => {
          setReactionOverride(toReactionSummary(res.data.data))
          setPickerOpen(false)
        },
      }
    )
  }

  const countOf = (type: FeedReactionSummaryResponseMyReactionsItem) =>
    reactionCounts.find((c) => c.reactionType === type)?.count ?? 0

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="리액션 추가"
        aria-expanded={isPickerOpen}
        onClick={() => setPickerOpen((prev) => !prev)}
        className="border-border-primary text-icon-quaternary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border"
      >
        <SmilePlus className="h-4 w-4" />
      </button>

      {REACTIONS.filter(({ type }) => countOf(type) > 0 || myReactions.includes(type)).map(
        ({ type, emoji }) => (
          <EmojiBtn
            key={type}
            emoji={emoji}
            label={`+${countOf(type)}`}
            selected={myReactions.includes(type)}
            onClick={() => handleReaction(type)}
          />
        )
      )}

      {isPickerOpen && (
        <div className="border-border-primary absolute bottom-10 left-0 z-20 flex gap-1 rounded-full border bg-white px-2 py-1.5 shadow-lg">
          {REACTIONS.map(({ type, emoji }) => (
            <button
              key={type}
              type="button"
              aria-label={type}
              onClick={() => handleReaction(type)}
              className="hover:bg-bg-secondary cursor-pointer rounded-full px-2 py-1 text-lg leading-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
