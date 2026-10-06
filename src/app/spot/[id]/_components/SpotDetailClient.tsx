'use client'

import { Bell, Heart, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Button } from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import { useSpotDetail } from '@/api/facades/spot'
import { useBloomCalendar } from '@/api/facades/seasonal-bloom'
import { useRemoveFavorite, useUpdateFavoriteNotify } from '@/api/facades/spot-favorite'
import { track, type SpotAction } from '@/lib/analytics'
import { enablePushForBloomAlert } from '@/lib/push/pushNotifications'
import {
  getGetSpotsByIdQueryKey,
  type getSpotsByIdResponse,
} from '@/api/facades/generated/spot/spot'
import type {
  FavoriteState,
  SpotDetailResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { buildRecordUrl } from '@/lib/utils/spotCta'
import { type BloomStageStatus, toStatusBadge } from '@/lib/utils/bloomStatus'
import { formatPeakPeriod, peakHeadline } from '@/lib/utils/bloomCalendar'
import { CATEGORY_ICON } from '@/constants/map'
import { formatMonthDay } from '@/lib/utils/explore'
import { cn } from '@/lib/utils/cn'
import { SafeImage } from '@/components/ui/display/SafeImage'
import { SpotOperatingInfo } from '@/app/spot/[id]/_components/SpotOperatingInfo'

// 캘린더(일별 타임라인)가 없으면 '이번 주말이 딱이에요' 판정을 못 하므로
// 상세 응답 배너의 현재 상태만으로 문구를 대체한다.
const BLOOM_BANNER_MESSAGE: Record<BloomStageStatus, string> = {
  BEFORE_SEASON: '아직 개화 전이에요',
  PREPARING: '곧 피기 시작해요',
  STARTED: '이제 막 피기 시작했어요',
  PEAK: '지금이 절정이에요',
  ENDED: '올해 절정은 지났어요',
}

interface SpotDetailClientProps {
  /** 서버에서 조회한 비로그인 기준 상세. 첫 HTML 에 본문을 담기 위해 받는다. */
  initialSpot: SpotDetailResponse
}

export function SpotDetailClient({ initialSpot }: SpotDetailClientProps) {
  const router = useRouter()
  const id = initialSpot.id
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)
  const queryClient = useQueryClient()
  const removeFavorite = useRemoveFavorite()
  const updateNotify = useUpdateFavoriteNotify()
  const requireLogin = useRequireLogin()

  // 상세 진입 1회. "지금 가기 좋은 곳"에 더 반응하는지 보려고 개화 단계를 같이 보낸다.
  // 개화 정보는 사용자와 무관해 서버 응답(initialSpot) 값으로 충분하다.
  const spotName = initialSpot.name
  const spotType = initialSpot.type
  const bloomCategory = initialSpot.bloom?.category
  const bloomStatus = initialSpot.bloom?.status
  useEffect(() => {
    track('spot_view', {
      spot_id: id,
      spot_name: spotName,
      spot_type: spotType,
      bloom_category: bloomCategory,
      bloom_status: bloomStatus,
    })
  }, [id, spotName, spotType, bloomCategory, bloomStatus])

  // 로그인 안내가 뜨기 전, 누른 순간에 보낸다.
  const trackAction = (action: SpotAction) =>
    track('spot_action_click', { action, spot_id: id })

  // 서버 응답에는 사용자 쿠키가 없어 찜·알림이 항상 false 다. 클라이언트가 쿠키를 실어 다시 조회해 덮어쓰고,
  // 그 전까지(또는 재조회 실패 시)는 서버 값을 그대로 보여준다.
  const { data } = useSpotDetail(id)
  const spot = data ?? initialSpot

  // 명소 연결이 없는 동네 스팟이거나 개화 정보가 없으면 캘린더를 조회하지 않는다.
  const { data: calendar } = useBloomCalendar(
    spot.attractionId && spot.bloom
      ? { attractionId: spot.attractionId, category: spot.bloom.category }
      : null
  )

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
    : spot.bloom
      ? BLOOM_BANNER_MESSAGE[spot.bloom.status]
      : ''

  // 찜 시트는 서버 응답 전에 닫히므로 상세 캐시의 찜 상태를 먼저 바꿔 하트·종을 바로 채운다.
  // 진행 중인 재조회가 늦게 도착해 옛 값으로 덮지 않도록 먼저 취소한다. 성공하면 시트가 상세 쿼리를 무효화해 서버 값으로 맞춰진다.
  const setFavoriteCache = (favorite: FavoriteState) => {
    const queryKey = getGetSpotsByIdQueryKey(id)
    void queryClient.cancelQueries({ queryKey })
    queryClient.setQueryData<getSpotsByIdResponse>(queryKey, (old) =>
      old?.data.data
        ? { ...old, data: { ...old.data, data: { ...old.data.data, favorite } } }
        : old
    )
  }

  // 시트는 찜하지 않은 상태에서만 열리므로, 실패하면 찜·알림 모두 꺼진 상태로 되돌린다.
  const openSaveSheet = () =>
    openSaveSpotDrawer({
      spotId: id,
      name: spot.name,
      location: spot.address ?? '',
      onSaved: (enabled) => setFavoriteCache({ favorited: true, notifyEnabled: enabled }),
      onSaveFailed: () => setFavoriteCache({ favorited: false, notifyEnabled: false }),
    })

  // 추가는 "개화 알림 받기" 토글이라는 실제 선택지가 있어 시트가 필요하지만,
  // 해제는 선택지가 없어 시트가 순수 마찰이라 HeartBtn과 동일하게 즉시 토글한다.
  // 해제·알림 토글은 응답을 기다리지 않고 상세 캐시에 먼저 반영하고, 실패하면 누르기 전 값으로 되돌린다.
  const handleSave = () => {
    if (favorited) {
      setFavoriteCache({ favorited: false, notifyEnabled: false })
      removeFavorite.mutate(
        { spotId: id },
        {
          onSuccess: () => {
            toast('찜을 해제했어요')
            queryClient.invalidateQueries({ queryKey: getGetSpotsByIdQueryKey(id) })
          },
          onError: (err) => {
            console.error(err)
            setFavoriteCache({ favorited, notifyEnabled })
            toast.error('찜을 해제하지 못했어요')
          },
        }
      )
      return
    }
    openSaveSheet()
  }

  // 알림은 찜에 붙은 설정이라 찜하지 않은 스팟은 알림만 켤 수 없다.
  // 이때는 알림 토글이 들어 있는 찜 추가 시트를 연다.
  const handleNotify = () => {
    if (!favorited) {
      openSaveSheet()
      return
    }
    setFavoriteCache({ favorited, notifyEnabled: !notifyEnabled })
    updateNotify.mutate(
      { spotId: id, data: { enabled: !notifyEnabled } },
      {
        onSuccess: () => {
          toast(notifyEnabled ? '만개 알림을 껐어요' : '만개 알림을 켰어요')
          if (!notifyEnabled) void enablePushForBloomAlert()
          queryClient.invalidateQueries({ queryKey: getGetSpotsByIdQueryKey(id) })
        },
        onError: (err) => {
          console.error(err)
          setFavoriteCache({ favorited, notifyEnabled })
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
          <SafeImage
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

      <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
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
                aria-label="만개 알림 받기"
                aria-pressed={favorited && notifyEnabled}
                onClick={() => {
                  trackAction(favorited && notifyEnabled ? 'alert_off' : 'alert_on')
                  requireLogin(handleNotify, '알림 설정을 하고 싶다면 로그인이 필요해요.')
                }}
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
                leftIcon={<Image src={CATEGORY_ICON[spot.bloom.category]} alt="" width={14} height={14} />}
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
            {/* 예측값이 언제 산출됐는지 보여준다 — 자주 바뀌는 정보의 최신성 표시 */}
            <p className="text-text-tertiary text-xs">
              {formatMonthDay(spot.bloom.baseDate)} 기준 개화 예측이에요
            </p>
          </div>
        )}

        {/* 운영 정보 (운영 시간·입장료·주차) — 관광공사 데이터가 없으면 숨긴다 */}
        {spot.operatingInfo && <SpotOperatingInfo info={spot.operatingInfo} />}
      </div>

      {/* 방문자 기록 (최대 3건) */}
      <div>
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
                  href: `/feed/${record.id}`,
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
          onClick={() => {
            trackAction(favorited ? 'unsave' : 'save')
            requireLogin(handleSave, '해당 장소를 찜하고 싶다면 로그인이 필요해요.')
          }}
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
          onClick={() => {
            trackAction('record')
            requireLogin(
              () => router.push(buildRecordUrl(spot.id)),
              '스팟 기록을 남기려면 로그인이 필요해요.'
            )
          }}
        >
          방문 기록 남기기
        </Button>
      </div>

      <LazyDrawer />
    </div>
  )
}
