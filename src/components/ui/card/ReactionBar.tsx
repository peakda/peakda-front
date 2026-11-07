'use client'

import { useEffect, useMemo, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import { toast } from 'sonner'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { useAddReaction, useRemoveReaction } from '@/api/facades/feed'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import {
  applyReactionToggle,
  isLegacyReactions,
  mergeReactionState,
  toReactionOverview,
  type ReactionAction,
  type ReactionEmoji,
} from '@/lib/utils/feed'
import { cn } from '@/lib/utils/cn'
import type {
  ReactionOverviewResponse,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

// 반응 추가/취소 안내 토스트 — 이모지를 제목, 안내 문구를 디스크립션으로 띄운다(시안 기준 어두운 배경).
function showReactionToast(action: ReactionAction, emoji: string) {
  toast(emoji, {
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
  // 피드는 v2 형식, 스팟 기록은 아직 v1 형식(❤️·😀)으로 내려온다.
  reactions: ReactionSummary | ReactionOverviewResponse
  className?: string
}

// 기록 하나의 리액션 줄. 맨 앞 추가 버튼(+이모지)으로 반응 추가 바텀시트를 열고,
// 남겨진 리액션(내가 누른 것 포함)만 카운트 칩으로 잇는다.
export function ReactionBar({ recordId, reactions, className }: ReactionBarProps) {
  // 변환 결과가 렌더마다 새 객체가 되지 않도록 원본 참조로 묶는다.
  const serverOverview = useMemo(() => toReactionOverview(reactions), [reactions])
  // 조회 응답의 리액션 요약을 그대로 보여주고, 이 화면에서 리액션을 누른 뒤에만
  // mutation 응답으로 덮어쓴다. (useState 초기값으로 두면 나중에 도착한 서버 값이 반영되지 않는다)
  const [reactionOverride, setReactionOverride] = useState<ReactionOverviewResponse | null>(null)
  const overview = reactionOverride ?? serverOverview
  const openReactionDrawer = useDrawerStore((s) => s.openReactionDrawer)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()
  const requireLogin = useRequireLogin()

  useEffect(() => setReactionOverride(null), [reactions, recordId])

  const handleReaction = (emoji: ReactionEmoji, action: ReactionAction) => {
    if (addReaction.isPending || removeReaction.isPending) return
    const mutation = action === 'add' ? addReaction : removeReaction
    // 응답을 기다리지 않고 먼저 반영하고, 실패하면 누르기 전 값으로 되돌린다.
    const previous = reactionOverride
    const optimistic = applyReactionToggle(overview, emoji, action)
    setReactionOverride(optimistic)
    mutation.mutate(
      { id: recordId, emojiKey: emoji.key },
      {
        onSuccess: (res) => {
          setReactionOverride((current) => mergeReactionState(current ?? optimistic, res.data.data))
          showReactionToast(action, emoji.emoji)
        },
        onError: () => {
          setReactionOverride(previous)
          toast.error('반응을 남기지 못했어요')
        },
      }
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <button
        type="button"
        aria-label="리액션 추가"
        onClick={() =>
          requireLogin(
            () =>
              openReactionDrawer({
                recordId,
                scope: isLegacyReactions(reactions) ? 'legacy' : 'all',
                selected: overview.items.filter((item) => item.reactedByMe).map((item) => item.key),
                onSelect: handleReaction,
              }),
            '반응을 남기고 싶다면 로그인이 필요해요.'
          )
        }
        className="border-border-primary text-icon-quaternary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border"
      >
        <SmilePlus className="h-4 w-4" />
      </button>

      {overview.items.map((item) => (
        <EmojiBtn
          key={item.key}
          emoji={item.emoji}
          label={`+${item.count}`}
          selected={item.reactedByMe}
          onClick={() =>
            requireLogin(
              () => handleReaction(item, item.reactedByMe ? 'remove' : 'add'),
              '반응을 남기고 싶다면 로그인이 필요해요.'
            )
          }
        />
      ))}
    </div>
  )
}
