'use client'

import { Heart, Share2, MapPin, Clock, Ticket, CalendarDays } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import Button from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { Drawer } from '@/components/ui/layout/Drawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { getMockSpot, MOCK_SPOT_FEEDS } from '@/app/spot/[id]/_data'

export default function SpotDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)

  const spot = getMockSpot(id)
  const previewFeed = MOCK_SPOT_FEEDS[0]

  const handleSave = () => openSaveSpotDrawer({ name: spot.name, location: spot.location })

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
                <Heart className="h-5 w-5 cursor-pointer text-gray-600" />
              </button>
            </div>
          }
        />
      </div>

      {/* 대표 이미지 */}
      <div className="relative h-64 bg-gray-200">
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <CardBadge label={spot.status} variant={spot.statusVariant} />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* 타이틀 + 위치 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-text-primary text-xl font-bold">{spot.name}</h1>
            {spot.flowers.map((flower) => (
              <Badge
                key={flower.label}
                label={flower.label}
                leftIcon={<span>{flower.emoji}</span>}
                variant="filled"
                color="pink"
              />
            ))}
          </div>
          <span className="text-text-secondary flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            {spot.location}
          </span>
        </div>

        {/* 개화 예상 시기 */}
        <Section title="개화 예상 시기">
          <Badge label={spot.bloomPeriod} variant="filled" color="green" className="w-fit" />
        </Section>

        {/* 축제 정보 (축제/행사 스팟에서만) */}
        {spot.type === 'festival' && spot.festival && (
          <Section title="축제 정보">
            <ul className="flex flex-col gap-2.5">
              <InfoRow icon={<Clock className="h-4 w-4" />} label="운영시간" value={spot.festival.hours} />
              <InfoRow icon={<Ticket className="h-4 w-4" />} label="요금" value={spot.festival.fee} />
              <InfoRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="기간"
                value={spot.festival.period}
              />
            </ul>
          </Section>
        )}

        {/* VISIT 가이드 */}
        <Section title="VISIT 가이드">
          <ul className="flex flex-col gap-1.5">
            {spot.guide.map((tip) => (
              <li key={tip} className="text-text-secondary flex gap-1.5 text-sm">
                <span className="text-text-tertiary">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Contents (스팟 피드 미리보기) */}
      <div className="border-border-primary border-t">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-text-primary text-base font-semibold">Contents</h2>
          <button
            type="button"
            className="text-text-tertiary cursor-pointer text-sm"
            onClick={() => router.push(`/spot/${spot.id}/feed`)}
          >
            더보기
          </button>
        </div>
        <FeedCard {...previewFeed} />
      </div>

      {/* 하단 CTA */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          aria-label="찜하기"
          onClick={handleSave}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200"
        >
          <Heart className="h-5 w-5 text-gray-400" />
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="text-text-tertiary flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-text-primary font-medium">{value}</span>
    </li>
  )
}
