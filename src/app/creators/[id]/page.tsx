'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
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
      <div className="flex flex-col gap-4 px-4 py-6">
        {chapters.map((chapter) => (
          <div
            key={chapter.sortOrder}
            className="border-border-primary flex flex-col gap-3 rounded-2xl border p-4"
          >
            {/* 컨텐츠 헤더 */}
            <div className="flex items-center gap-2">
              <span className="bg-brand-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {String(chapter.sortOrder).padStart(2, '0')}
              </span>
              <span className="text-text-tertiary text-xs">{chapter.heading}</span>
            </div>

            {/* 사진 카드 */}
            {chapter.photoUrl ? (
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
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

            {/* 장소명 */}
            <h2 className="text-text-primary text-lg font-extrabold">{chapter.placeName}</h2>

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

            <MapLinkButton
              spotId={chapter.spotId}
              latitude={chapter.latitude}
              longitude={chapter.longitude}
            />
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
              spotId={item.spotId}
              latitude={item.latitude}
              longitude={item.longitude}
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

// 좌표가 있으면 그 위치의 지도로, 없으면 연결된 스팟 상세로 보낸다.
// 둘 다 없는 카드도 시안대로 버튼은 노출하고 큐레이션 지도로 보낸다.
function MapLinkButton({
  spotId,
  latitude,
  longitude,
}: {
  spotId?: number | null
  latitude?: number | null
  longitude?: number | null
}) {
  const router = useRouter()

  const href =
    latitude != null && longitude != null
      ? `/map?lat=${latitude}&lng=${longitude}`
      : spotId
        ? `/spot/${spotId}`
        : '/map'

  return (
    <Button
      variant="outlined"
      color="default"
      className="w-full justify-between rounded-xl"
      rightIcon={<ChevronRight className="h-4 w-4" />}
      onClick={() => router.push(href)}
    >
      지도에서 보기
    </Button>
  )
}

function RecommendationCard({
  title,
  placeName,
  photoUrl,
  body,
  spotId,
  latitude,
  longitude,
}: {
  title: string
  placeName: string
  photoUrl?: string | null
  body: string
  spotId?: number | null
  latitude?: number | null
  longitude?: number | null
}) {
  return (
    <div className="border-border-primary flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-text-primary text-base font-bold">{title}</span>
        <span className="text-text-tertiary text-xs">{placeName}</span>
      </div>

      {photoUrl && (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
          <Image
            src={photoUrl}
            alt={placeName}
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
        </div>
      )}

      <p className="text-text-secondary text-sm leading-[1.5]">{body}</p>

      <MapLinkButton spotId={spotId} latitude={latitude} longitude={longitude} />
    </div>
  )
}
