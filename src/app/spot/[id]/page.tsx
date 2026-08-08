'use client'

import Image from 'next/image'
import { Heart, Share2, MapPin } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { buildRecordUrl, canUseWebShare, isShareAbort } from '@/lib/utils/spotCta'
import { cn } from '@/lib/utils/cn'

const BLOOM_STATUS_LABEL: Record<string, string> = {
  PREPARING: '이르다',
  STARTED: '이제 막요',
  PEAK: '절정',
  ENDED: '끝났어요',
}

const BLOOM_STATUS_VARIANT: Record<string, 'green' | 'starting' | 'bloom' | 'late'> = {
  PREPARING: 'green',
  STARTED: 'starting',
  PEAK: 'bloom',
  ENDED: 'late',
}

const BLOOM_BANNER_MESSAGE: Record<string, string> = {
  PREPARING: '곧 피기 시작해요',
  STARTED: '이제 막 피기 시작했어요',
  PEAK: '지금이 절정이에요',
  ENDED: '올해 절정은 지났어요',
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const BLOOM_CATEGORY_EMOJI: Record<string, string> = {
  PLUM: '🌸',
  FORSYTHIA: '🌼',
  AZALEA_KR: '🌺',
  CHERRY: '🌸',
  CANOLA: '🌻',
  AZALEA: '🌺',
  HYDRANGEA: '💐',
  LOTUS: '🪷',
  COSMOS: '🌸',
  PINK_MUHLY: '🌸',
  SILVERGRASS: '🍂',
  MAPLE: '🍁',
  CAMELLIA: '🌹',
}

export default function SpotDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)

  const { data: spot, isLoading, isError, refetch } = useSpotDetail(Number(id))

  if (isLoading) {
    return (
      <div className="bg-bg-primary flex min-h-screen flex-col" aria-busy="true">
        <div className="h-14">
          <Header left={<LeftArrow />} />
        </div>
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
      <div className="bg-bg-primary flex min-h-screen flex-col">
        <div className="h-14">
          <Header left={<LeftArrow />} />
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
  const favorited = spot.favorite.favorited
  const bloomPeriod = (() => {
    if (!spot.bloom) return ''
    const { peakStartDate: s, peakEndDate: e } = spot.bloom
    // 'YYYY-MM-DD' → 'M.D(요일)'
    const fmt = (iso: string) => {
      const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
      return `${m}.${d}(${WEEKDAY[new Date(y, m - 1, d).getDay()]})`
    }
    if (s && e) return `${fmt(s)} ~ ${fmt(e)}`
    if (s) return `${fmt(s)} ~`
    if (e) return `~ ${fmt(e)}`
    return ''
  })()

  const handleSave = () =>
    openSaveSpotDrawer({ spotId: Number(id), name: spot.name, location: spot.address ?? '' })

  // Web Share 지원 기기는 공유 시트, 아니면 링크 복사로 대체한다.
  const handleShare = async () => {
    const url = window.location.href
    try {
      if (canUseWebShare(navigator)) {
        await navigator.share({ title: spot.name, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast('링크를 복사했어요')
    } catch (err) {
      // 사용자가 공유 시트를 닫은 것뿐이면 실패가 아니다.
      if (isShareAbort(err)) return
      console.error(err)
      toast.error('공유하지 못했어요')
    }
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      <div className="h-14">
        <Header left={<LeftArrow />} />
      </div>

      {/* 대표 이미지 */}
      <div className="relative h-64 bg-gray-200">
        {spot.representativeImageUrl && (
          <Image src={spot.representativeImageUrl} alt={spot.name} fill className="object-cover" />
        )}
        {spot.bloom && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            <CardBadge
              label={BLOOM_STATUS_LABEL[spot.bloom.status] ?? spot.bloom.status}
              variant={BLOOM_STATUS_VARIANT[spot.bloom.status] ?? 'secondary'}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* 타이틀 + 위치 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-text-primary text-xl font-bold">{spot.name}</h1>
              {spot.bloom && (
                <Badge
                  label={spot.bloom.displayName}
                  leftIcon={<span>{BLOOM_CATEGORY_EMOJI[spot.bloom.category] ?? '🌸'}</span>}
                  variant="filled"
                  color="pink"
                />
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3 pt-1">
              <button type="button" aria-label="찜하기" onClick={handleSave}>
                <Heart
                  className={cn(
                    'h-5 w-5 cursor-pointer',
                    favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
                  )}
                />
              </button>
              <button type="button" aria-label="공유" onClick={handleShare}>
                <Share2 className="h-5 w-5 cursor-pointer text-gray-600" />
              </button>
            </div>
          </div>
          <span className="text-text-secondary flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            {spot.address ?? ''}
          </span>
        </div>

        {/* 올해 만개 시기 */}
        {spot.bloom && (
          <Section title="올해 만개 시기">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-green-50 px-4 py-3">
              <span className="text-sm font-semibold text-green-600">
                {BLOOM_BANNER_MESSAGE[spot.bloom.status] ?? spot.bloom.displayName}
              </span>
              {bloomPeriod && (
                <span className="text-sm font-medium text-green-500">{bloomPeriod}</span>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* 최신 방문 기록 (최대 3건) */}
      <div className="border-border-primary border-t">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-text-primary text-base font-semibold">최신 방문 기록</h2>
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
              <FeedCard key={record.id} {...toFeedCardProps(record)} />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      {children}
    </div>
  )
}
