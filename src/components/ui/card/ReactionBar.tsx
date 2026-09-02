'use client'

import { useState } from 'react'
import { SmilePlus } from 'lucide-react'
import { toast } from 'sonner'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { useAddReaction, useRemoveReaction } from '@/api/facades/feed'
import { REACTIONS } from '@/constants/reaction'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { reactionToggleAction, toReactionSummary } from '@/lib/utils/feed'
import { cn } from '@/lib/utils/cn'
import type {
  FeedReactionSummaryResponseMyReactionsItem,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

// 반응 추가/취소 안내 토스트 — 이모지를 제목, 안내 문구를 디스크립션으로 띄운다(시안 기준 어두운 배경).
function showReactionToast(
  action: 'add' | 'remove',
  type: FeedReactionSummaryResponseMyReactionsItem
) {
  toast(REACTIONS.find((r) => r.type === type)?.emoji ?? '', {
    description: action === 'add' ? '이모지 반응이 추가되었습니다!' : '반응이 취소 되었습니다.',
    classNames: {
      toast: 'bg-gray-900! border-gray-900! text-gray-0!',
      title: 'text-xl! leading-none!',
      description: 'text-gray-0!',
    },
  })
}

interface ReactionBarProps {
  recordId: number
  reactions: ReactionSummary
  className?: string
}

// 기록 하나의 리액션 줄. 맨 앞 추가 버튼(+이모지)으로 반응 추가 바텀시트를 열고,
// 남겨진 리액션(내가 누른 것 포함)만 카운트 칩으로 잇는다.
export function ReactionBar({ recordId, reactions, className }: ReactionBarProps) {
  // 조회 응답의 리액션 요약을 그대로 보여주고, 이 화면에서 리액션을 누른 뒤에만
  // mutation 응답으로 덮어쓴다. (useState 초기값으로 두면 나중에 도착한 서버 값이 반영되지 않는다)
  const [reactionOverride, setReactionOverride] = useState<ReactionSummary | null>(null)
  const { counts: reactionCounts, myReactions } = reactionOverride ?? reactions
  const openReactionDrawer = useDrawerStore((s) => s.openReactionDrawer)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()

  const handleReaction = (type: FeedReactionSummaryResponseMyReactionsItem) => {
    const action = reactionToggleAction(myReactions, type)
    const mutation = action === 'add' ? addReaction : removeReaction
    mutation.mutate(
      { id: recordId, params: { reactionType: type } },
      {
        onSuccess: (res) => {
          setReactionOverride(toReactionSummary(res.data.data))
          showReactionToast(action, type)
        },
      }
    )
  }

  const countOf = (type: FeedReactionSummaryResponseMyReactionsItem) =>
    reactionCounts.find((c) => c.reactionType === type)?.count ?? 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="리액션 추가"
        onClick={() => openReactionDrawer({ selected: myReactions, onSelect: handleReaction })}
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
    </div>
  )
}
