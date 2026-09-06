'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
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
            className="border-border-primary flex flex-col gap-4 rounded-2xl border p-4"
          >
            {/* 컨텐츠 헤더 — 번호와 소제목 모두 포인트 컬러 */}
            <div className="text-brand-primary flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold">
                {String(chapter.sortOrder).padStart(2, '0')}
              </span>
              <span className="text-sm font-bold">{chapter.heading}</span>
            </div>

            {/* 사진 카드 — 개화 뱃지는 좌상단, 장소명은 하단 그라데이션 위에 */}
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
                <PhotoCaption placeName={chapter.placeName} leadText={chapter.leadText} />
              </div>
            ) : (
              <>
                {chapter.badge && (
                  <CardBadge
                    label={`${chapter.badge.displayName} ${BLOOM_STATUS_LABEL[chapter.badge.status] ?? ''}`.trim()}
                    variant={BLOOM_STATUS_VARIANT[chapter.badge.status] ?? 'secondary'}
                    className="w-fit"
                  />
                )}
                <h2 className="text-text-primary text-lg font-extrabold">{chapter.placeName}</h2>
              </>
            )}

            {/* 풀쿼트 — 사진 바로 아래 굵은 두 줄 (Title/1 18px) */}
            {chapter.pullQuote && (
              <p className="text-text-primary text-lg leading-[1.6] font-bold">
                {chapter.pullQuote}
              </p>
            )}

            {/* 본문 텍스트 (Body 3/Regular 14px) */}
            <p className="text-text-secondary text-sm leading-[1.5] whitespace-pre-line">
              {chapter.body}
            </p>

            {/* 운영기간·입장료·주의사항 (Body 4/Regular 13px) */}
            {chapter.factNote && (
              <p className="text-text-tertiary text-[13px] leading-[1.5] whitespace-pre-line">
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
        <div className="border-border-primary flex flex-col gap-4 border-t px-4 py-6">
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
        <div className="bg-brand-secondary/10 mx-4 mb-6 flex flex-col gap-1 rounded-xl p-4">
          {curation.nextTeaserOverline && (
            <span className="text-brand-primary text-xs font-bold">
              {curation.nextTeaserOverline}
            </span>
          )}
          {curation.nextTeaserBody && (
            <p className="text-text-primary text-sm leading-[1.5] whitespace-pre-line">
              {curation.nextTeaserBody}
            </p>
          )}
        </div>
      )}

      {/* 에디토리얼 푸터 */}
      <p className="text-text-tertiary pb-6 text-center text-[11px]">
        PEAKDA · 이번 주말, 가장 반짝하는 순간을 찾아드려요
      </p>

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

// 사진 하단 그라데이션 위에 얹는 장소명 + 위치 설명(leadText).
function PhotoCaption({ placeName, leadText }: { placeName: string; leadText?: string | null }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
      <span className="text-base font-bold text-white">{placeName}</span>
      {leadText && <span className="text-[11px] text-white/80">{leadText}</span>}
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
      size="md"
      className="h-10 w-full gap-2 rounded-full"
      rightIcon={<ArrowRight className="h-4 w-4" />}
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
    <div className="border-border-primary flex flex-col gap-4 rounded-2xl border p-4">
      <p className="border-text-primary text-text-primary border-l-2 pl-3 text-lg leading-[1.6] font-bold">
        {title}
      </p>

      {photoUrl ? (
        <div className="relative h-45 w-full overflow-hidden rounded-2xl">
          <Image
            src={photoUrl}
            alt={placeName}
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
          <PhotoCaption placeName={placeName} />
        </div>
      ) : (
        <span className="text-text-tertiary text-xs">{placeName}</span>
      )}

      <p className="text-text-secondary text-sm leading-[1.6]">{body}</p>

      <MapLinkButton spotId={spotId} latitude={latitude} longitude={longitude} />
    </div>
  )
}
