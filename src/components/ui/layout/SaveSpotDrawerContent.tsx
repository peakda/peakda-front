'use client'

import { MapPin } from 'lucide-react'
import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button/Button'
import { Toggle } from '@/components/ui/display/Toggle'
import { useAddFavorite, useUpdateFavoriteNotify } from '@/api/facades/spot-favorite'
import { getGetSpotsByIdQueryKey } from '@/api/facades/generated/spot/spot'
import type { SaveSpotData } from '@/stores/useDrawerStore'

interface Props {
  spot: SaveSpotData
  onClose: () => void
}

export function SaveSpotDrawerContent({ spot, onClose }: Props) {
  const notifyEnabled = useRef(true)
  const queryClient = useQueryClient()
  const addFavorite = useAddFavorite()
  const updateNotify = useUpdateFavoriteNotify()

  // 서버 응답을 기다렸다 닫으면 시트가 멈춘 듯 보여, 먼저 닫고 카드에 반영한 뒤 실패하면 되돌린다.
  // 시트가 닫히며 언마운트돼도 끝까지 이어지도록 mutate 콜백 대신 mutateAsync 를 기다린다.
  const handleConfirm = async () => {
    const notify = notifyEnabled.current
    spot.onSaved?.(notify)
    onClose()

    try {
      await addFavorite.mutateAsync({ spotId: spot.spotId })
    } catch (err) {
      console.error(err)
      toast.error('찜하지 못했어요')
      spot.onSaveFailed?.()
      return
    }
    // 상세 화면 하트 상태(favorited)를 즉시 반영하기 위해 상세 쿼리 무효화
    void queryClient.invalidateQueries({ queryKey: getGetSpotsByIdQueryKey(spot.spotId) })

    // 찜 추가 시 만개 알림이 기본 활성화되므로, 토글을 끈 경우에만 알림 해제 요청
    if (notify) return
    try {
      await updateNotify.mutateAsync({ spotId: spot.spotId, data: { enabled: false } })
    } catch (err) {
      console.error(err)
      toast.error('알림 설정을 바꾸지 못했어요')
      // 찜은 됐고 알림은 서버 기본값(켜짐) 그대로다.
      spot.onSaved?.(true)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-2 pb-8">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-text-primary text-lg font-bold">찜 목록에 추가할까요?</h2>
        <p className="text-text-secondary text-sm">
          찜한 스팟은 언제든 MY탭에서 다시 볼 수 있어요.
        </p>
      </div>

      {/* 스팟 정보 */}
      <div className="bg-bg-tertiary flex flex-col gap-0.5 rounded-xl p-4">
        <span className="text-text-primary text-base font-semibold">{spot.name}</span>
        <span className="text-text-secondary flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {spot.location}
        </span>
      </div>

      {/* 개화 알림 토글 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-text-primary text-sm font-semibold">개화 알림 받기</span>
          <span className="text-text-tertiary text-xs">만개가 임박하면 알려드려요.</span>
        </div>
        <Toggle label="개화 알림 받기" initialStatus={true} onChange={(isOn) => (notifyEnabled.current = isOn)} />
      </div>

      <Button
        variant="filled"
        color="primary"
        size="lg"
        className="w-full"
        onClick={() => void handleConfirm()}
        disabled={addFavorite.isPending}
      >
        확인
      </Button>
    </div>
  )
}
