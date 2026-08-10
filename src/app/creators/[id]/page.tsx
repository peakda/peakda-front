'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Button } from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { useCurationDetail } from '@/api/facades/curation'

// BloomBadge.status → 스팟 상세와 동일한 표기를 쓴다.
const BLOOM_STATUS_LABEL: Record<string, string> = {
  PREPARING: '이르다',
  STARTED: '이제 막요',
  PEAK: '절정',
}

const BLOOM_STATUS_VARIANT: Record<string, 'green' | 'starting' | 'bloom'> = {
  PREPARING: 'green',
  STARTED: 'starting',
  PEAK: 'bloom',
}

const HERO_PLACEHOLDER = '/images/explore.png'

export default function CreatorDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  // lat/lng 를 넘기지 않으므로 distanceMeters 는 항상 null 이다(현재 위치를 받는 UI 가 없다).
  const { data: curation } = useCurationDetail(Number(id))

  if (!curation) return null

  const chapters = [...curation.chapters].sort((a, b) => a.sortOrder - b.sortOrder)
  const recommendations = [...curation.recommendations].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      {/* 히어로 이미지 */}
      <div className="relative h-[411px] w-full">
        <Header left={<LeftArrow />} />
        <Image
          src={curation.heroImageUrl ?? HERO_PLACEHOLDER}
          alt={curation.title}
          fill
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-2 p-4">
          <Badge label={curation.weekLabel} variant="filled" color="white" className="w-fit" />
          <h1 className="text-xl leading-tight font-bold whitespace-pre-line text-white">
            {curation.title}
          </h1>
          {curation.subtitle && <p className="text-sm text-white/80">{curation.subtitle}</p>}
        </div>
      </div>

      {/* 에디토리얼 구분선 */}
      <div className="border-border-primary bg-bg-secondary h-2 border-y" />

      {/* 도입글 */}
      {curation.intro && (
        <p className="text-text-secondary px-4 pt-6 text-sm leading-[1.6] whitespace-pre-line">
          {curation.intro}
        </p>
      )}

      {/* 챕터 리스트 */}
      <div className="flex flex-col gap-8 px-4 py-6">
        {chapters.map((chapter) => (
          <div key={chapter.sortOrder} className="flex flex-col gap-3">
            {/* 컨텐츠 헤더 */}
            <div className="flex items-center gap-2">
              <span className="bg-brand-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {String(chapter.sortOrder).padStart(2, '0')}
              </span>
              <span className="text-text-tertiary text-xs">{chapter.heading}</span>
            </div>
            <h2 className="text-text-primary text-lg font-extrabold">{chapter.placeName}</h2>

            {/* 사진 카드 */}
            {chapter.photoUrl ? (
              <div className="relative h-45 w-full overflow-hidden rounded-2xl">
                <Image
                  src={chapter.photoUrl}
                  alt={chapter.placeName}
                  fill
                  sizes="(max-width: 430px) 100vw, 430px"
                  className="object-cover"
                />
                {chapter.badge && (
                  <CardBadge
                    label={`${chapter.badge.displayName} ${BLOOM_STATUS_LABEL[chapter.badge.status] ?? ''}`.trim()}
                    variant={BLOOM_STATUS_VARIANT[chapter.badge.status] ?? 'secondary'}
                    className="absolute top-2 left-2"
                  />
                )}
              </div>
            ) : (
              chapter.badge && (
                <CardBadge
                  label={`${chapter.badge.displayName} ${BLOOM_STATUS_LABEL[chapter.badge.status] ?? ''}`.trim()}
                  variant={BLOOM_STATUS_VARIANT[chapter.badge.status] ?? 'secondary'}
                  className="w-fit"
                />
              )
            )}

            {/* 리드 텍스트 */}
            {chapter.leadText && (
              <p className="text-text-primary text-sm leading-[1.6] font-medium">
                {chapter.leadText}
              </p>
            )}

            {/* 본문 텍스트 */}
            <p className="text-text-secondary text-sm leading-[1.5] whitespace-pre-line">
              {chapter.body}
            </p>

            {/* 풀쿼트 */}
            {chapter.pullQuote && (
              <p className="border-brand-secondary text-text-primary border-l-2 pl-3 text-sm leading-[1.6] italic">
                {chapter.pullQuote}
              </p>
            )}

            {/* 운영기간·입장료·주의사항 */}
            {chapter.factNote && (
              <p className="bg-bg-secondary text-text-tertiary rounded-xl p-3 text-xs leading-[1.5] whitespace-pre-line">
                {chapter.factNote}
              </p>
            )}

            {/* 지도에서 보기 — 연결된 스팟이 있을 때만 */}
            {chapter.spotId && (
              <button
                type="button"
                className="text-text-secondary flex w-fit items-center gap-1 text-sm"
                onClick={() => router.push(`/spot/${chapter.spotId}`)}
              >
                <MapPin className="h-3.5 w-3.5" />
                지도에서 보기
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 당일치기 추천 */}
      {recommendations.length > 0 && (
        <div className="border-border-primary flex flex-col gap-3 border-t px-4 py-6">
          <h2 className="text-text-primary text-base font-semibold">당일치기 추천</h2>
          {recommendations.map((item) => (
            <RecommendationCard
              key={item.sortOrder}
              title={item.title}
              placeName={item.placeName}
              photoUrl={item.photoUrl}
              body={item.body}
              onClick={item.spotId ? () => router.push(`/spot/${item.spotId}`) : undefined}
            />
          ))}
        </div>
      )}

      {/* 다음 주 예고 */}
      {(curation.nextTeaserOverline || curation.nextTeaserBody) && (
        <div className="bg-bg-secondary mx-4 mb-6 flex flex-col gap-1 rounded-xl p-4">
          {curation.nextTeaserOverline && (
            <span className="text-text-tertiary text-xs">{curation.nextTeaserOverline}</span>
          )}
          {curation.nextTeaserBody && (
            <p className="text-text-primary text-sm leading-[1.5] whitespace-pre-line">
              {curation.nextTeaserBody}
            </p>
          )}
        </div>
      )}

      {/* 하단 CTA → 큐레이션 지도 뷰 (라우트 미정) */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="flex-1"
          onClick={() => router.push('/map')}
        >
          큐레이션 지도 보기
        </Button>
      </div>
    </div>
  )
}

function RecommendationCard({
  title,
  placeName,
  photoUrl,
  body,
  onClick,
}: {
  title: string
  placeName: string
  photoUrl?: string | null
  body: string
  onClick?: () => void
}) {
  return (
    <div
      className={onClick ? 'flex cursor-pointer items-center gap-3' : 'flex items-center gap-3'}
      onClick={onClick}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200">
        {photoUrl && (
          <Image src={photoUrl} alt={placeName} fill sizes="80px" className="object-cover" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-text-primary text-sm font-semibold">{title}</span>
        <span className="text-text-tertiary text-xs">{placeName}</span>
        <span className="text-text-secondary text-xs leading-[1.5]">{body}</span>
      </div>
    </div>
  )
}
