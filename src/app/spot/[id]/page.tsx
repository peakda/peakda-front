'use client'

import Image from 'next/image'
import { Heart, Share2, MapPin } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import Button from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { Drawer } from '@/components/ui/layout/Drawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import { useSpotDetail } from '@/api/facades/spot'
import { cn } from '@/lib/utils/cn'

const BLOOM_STATUS_LABEL: Record<string, string> = {
  PREPARING: '이르다',
  STARTED: '이제 막요',
  PEAK: '절정',
  ENDED: '끝났어요',
}

const BLOOM_STATUS_VARIANT: Record<string, 'green' | 'bloom' | 'secondary'> = {
  PREPARING: 'green',
  STARTED: 'green',
  PEAK: 'bloom',
  ENDED: 'secondary',
}

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

  const { data: spot } = useSpotDetail(Number(id))

  if (!spot) return null

  const previewRecord = spot.recordPreview?.[0]
  const favorited = spot.favorite.favorited
  const bloomPeriod = (() => {
    if (!spot.bloom) return ''
    const { peakStartDate: s, peakEndDate: e } = spot.bloom
    const fmt = (d: string) => d.slice(5, 10).replace('-', '.')
    if (s && e) return `${fmt(s)} ~ ${fmt(e)}`
    if (s) return `${fmt(s)} ~`
    if (e) return `~ ${fmt(e)}`
    return ''
  })()

  const handleSave = () =>
    openSaveSpotDrawer({ name: spot.name, location: spot.address ?? '' })

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          right={
            <div className="flex items-center gap-3">
              <button type="button" aria-label="공유">
                <Share2 className="h-5 w-5 cursor-pointer text-gray-600" />
              </button>
              <button type="button" aria-label="찜하기" onClick={handleSave}>
                <Heart
                  className={cn(
                    'h-5 w-5 cursor-pointer',
                    favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-600',
                  )}
                />
              </button>
            </div>
          }
        />
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
          <div className="flex items-center gap-2">
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
          <span className="text-text-secondary flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            {spot.address ?? ''}
          </span>
        </div>

        {/* 개화 예상 시기 */}
        {bloomPeriod && (
          <Section title="개화 예상 시기">
            <Badge label={bloomPeriod} variant="filled" color="green" className="w-fit" />
          </Section>
        )}
      </div>

      {/* Contents (스팟 피드 미리보기) */}
      <div className="border-border-primary border-t">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-text-primary text-base font-semibold">Contents</h2>
          <button
            type="button"
            className="text-text-tertiary cursor-pointer text-sm"
            onClick={() => router.push(`/spot/${id}/feed`)}
          >
            더보기
          </button>
        </div>
        {previewRecord && <FeedCard {...toFeedCardProps(previewRecord)} />}
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
          onClick={() => router.push('/record')}
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
