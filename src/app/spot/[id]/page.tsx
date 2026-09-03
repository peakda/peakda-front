'use client'

import Image from 'next/image'
import { Bell, Heart, MapPin } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Button } from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { Drawer } from '@/components/ui/layout/Drawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import { useSpotDetail } from '@/api/facades/spot'
import { useBloomCalendar } from '@/api/facades/seasonal-bloom'
import { useRemoveFavorite, useUpdateFavoriteNotify } from '@/api/facades/spot-favorite'
import { getGetSpotsByIdQueryKey } from '@/api/facades/generated/spot/spot'
import { buildRecordUrl } from '@/lib/utils/spotCta'
import { toStatusBadge } from '@/lib/utils/bloomStatus'
import { BLOOM_CATEGORY_EMOJI, formatPeakPeriod, peakHeadline } from '@/lib/utils/bloomCalendar'
import { cn } from '@/lib/utils/cn'

// 캘린더(일별 타임라인)가 없으면 '이번 주말이 딱이에요' 판정을 못 하므로
// 상세 응답 배너의 현재 상태만으로 문구를 대체한다.
const BLOOM_BANNER_MESSAGE: Record<string, string> = {
  PREPARING: '곧 피기 시작해요',
  STARTED: '이제 막 피기 시작했어요',
  PEAK: '지금이 절정이에요',
  ENDED: '올해 절정은 지났어요',
}

export default function SpotDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)
  const queryClient = useQueryClient()
  const removeFavorite = useRemoveFavorite()
  const updateNotify = useUpdateFavoriteNotify()

  const { data: spot, isLoading, isError, refetch } = useSpotDetail(Number(id))

  useEffect(() => {
    if (spot?.name) document.title = `Peakda | ${spot.name}`
  }, [spot?.name])
  // 명소 연결이 없는 동네 스팟이거나 개화 정보가 없으면 캘린더를 조회하지 않는다.
  const { data: calendar } = useBloomCalendar(
    spot?.attractionId && spot.bloom
      ? { attractionId: spot.attractionId, category: spot.bloom.category }
      : null
  )

  if (isLoading) {
    return (
      <div className="bg-bg-primary flex min-h-screen flex-col" aria-busy="true">
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    )
  }

  // 404·네트워크 오류·잘못된 id 모두 여기로 온다. 백지 대신 재시도 수단을 준다.
  if (isError || !spot) {
    return (
      <div className="bg-bg-primary relative flex min-h-screen flex-col">
        <div className="h-14">
          <Header left={<LeftArrow />} className="top-3" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <p className="text-text-secondary text-sm">정보를 불러오지 못했어요</p>
          <Button variant="outlined" color="primary" size="md" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  const previewRecords = spot.recordPreview ?? []
  const { favorited, notifyEnabled } = spot.favorite
  const statusBadge = toStatusBadge(spot.bloom?.status)
  // 절정 구간·지속일은 캘린더가 있으면 캘린더를, 없으면 상세 응답의 배너 값을 쓴다.
  const bloomPeriod = formatPeakPeriod(
    calendar?.peakStartDate ?? spot.bloom?.peakStartDate,
    calendar?.peakEndDate ?? spot.bloom?.peakEndDate
  )
  const durationDays = calendar?.peakDurationDays ?? spot.bloom?.peakDurationDays
  const headline = calendar
    ? peakHeadline(calendar)
    : (BLOOM_BANNER_MESSAGE[spot.bloom?.status ?? ''] ?? '')

  // 추가는 "개화 알림 받기" 토글이라는 실제 선택지가 있어 시트가 필요하지만,
  // 해제는 선택지가 없어 시트가 순수 마찰이라 HeartBtn과 동일하게 즉시 토글한다.
  const handleSave = () => {
    if (favorited) {
      removeFavorite.mutate(
        { spotId: Number(id) },
        {
          onSuccess: () => {
            toast('찜을 해제했어요')
            queryClient.invalidateQueries({ queryKey: getGetSpotsByIdQueryKey(Number(id)) })
          },
          onError: (err) => {
            console.error(err)
            toast.error('찜을 해제하지 못했어요')
          },
        }
      )
      return
    }
    openSaveSpotDrawer({ spotId: Number(id), name: spot.name, location: spot.address ?? '' })
  }

  // 알림은 찜에 붙은 설정이라 찜하지 않은 스팟은 알림만 켤 수 없다.
  // 이때는 알림 토글이 들어 있는 찜 추가 시트를 연다.
  const handleNotify = () => {
    if (!favorited) {
      openSaveSpotDrawer({ spotId: Number(id), name: spot.name, location: spot.address ?? '' })
      return
    }
    updateNotify.mutate(
      { spotId: Number(id), data: { enabled: !notifyEnabled } },
      {
        onSuccess: () => {
          toast(notifyEnabled ? '만개 알림을 껐어요' : '만개 알림을 켰어요')
          queryClient.invalidateQueries({ queryKey: getGetSpotsByIdQueryKey(Number(id)) })
        },
        onError: (err) => {
          console.error(err)
          toast.error('알림 설정을 바꾸지 못했어요')
        },
      }
    )
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      {/* 대표 이미지 — 뒤로가기를 이미지 위에 겹친다 */}
      <div className="relative h-64 bg-gray-200">
        {spot.representativeImageUrl && (
          <Image
            src={spot.representativeImageUrl}
            alt={spot.name}
            fill
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
        )}
        <Header left={<LeftArrow />} className="top-3" />
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* 타이틀 + 위치 + 요약 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {statusBadge.statusVariant && (
                <CardBadge label={statusBadge.status} variant={statusBadge.statusVariant} />
              )}
              <h1 className="text-text-primary text-xl font-bold">{spot.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3 pt-1">
              <button
                type="button"
                aria-label="찜하기"
                onClick={handleSave}
                disabled={removeFavorite.isPending}
              >
                <Heart
                  className={cn(
                    'h-5 w-5 cursor-pointer',
                    favorited ? 'fill-brand-primary text-brand-primary' : 'text-gray-400'
                  )}
                />
              </button>
              <button
                type="button"
                aria-label="만개 알림 받기"
                aria-pressed={favorited && notifyEnabled}
                onClick={handleNotify}
                disabled={updateNotify.isPending}
              >
                <Bell
                  className={cn(
                    'h-5 w-5 cursor-pointer',
                    favorited && notifyEnabled
                      ? 'fill-brand-primary text-brand-primary'
                      : 'text-gray-400'
                  )}
                />
              </button>
            </div>
          </div>

          <span className="text-text-secondary flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            {spot.address ?? ''}
          </span>

          <span className="text-text-tertiary text-xs">
            방문 기록 {spot.recordCount}
            {durationDays ? ` · 만개지속일 ${durationDays}일` : ''}
          </span>

          {spot.bloom && (
            <div className="pt-1">
              <Badge
                label={spot.bloom.displayName}
                leftIcon={<span>{BLOOM_CATEGORY_EMOJI[spot.bloom.category]}</span>}
                variant="filled"
                color="pink"
              />
            </div>
          )}
        </div>

        {/* 올해 만개 시기 */}
        {spot.bloom && headline && (
          <div className="flex flex-col gap-2">
            <h2 className="text-text-primary text-base font-semibold">올해 만개 시기</h2>
            <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
              <span className="text-sm font-semibold text-green-600">
                {headline}
                {bloomPeriod && ` — ${bloomPeriod}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 방문자 기록 (최대 3건) */}
      <div className="border-border-primary border-t">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-text-primary text-base font-semibold">
            방문자 기록({spot.recordCount})
          </h2>
          <button
            type="button"
            className="text-text-tertiary cursor-pointer text-sm"
            onClick={() => router.push(`/spot/${id}/feed`)}
          >
            더보기
          </button>
        </div>
        {previewRecords.length === 0 ? (
          <p className="text-text-tertiary py-10 text-center text-sm">아직 기록이 없어요</p>
        ) : (
          <div className="divide-border-primary divide-y">
            {previewRecords.map((record) => (
              <FeedCard
                key={record.id}
                {...toFeedCardProps(record, {
                  onOpen: () => router.push(`/feed/${record.id}`),
                })}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          aria-label="찜하기"
          onClick={handleSave}
          disabled={removeFavorite.isPending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200"
        >
          <Heart
            className={cn('h-5 w-5', favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400')}
          />
        </button>
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="flex-1"
          onClick={() => router.push(buildRecordUrl(spot.id))}
        >
          방문 기록 남기기
        </Button>
      </div>

      <Drawer />
    </div>
  )
}
