'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { useExploreSpots } from '@/api/facades/explore'
import { GetExploreSpotsSection } from '@/api/facades/generated/peakdaApi.schemas'
import { toExploreSpotProps } from '@/lib/utils/explore'

const SECTION_TITLE: Record<GetExploreSpotsSection, string> = {
  PEAK_NOW: '지금이 절정이에요',
  NEXT_WEEK: '다음 주에 가면 좋을 곳',
}

function ExploreSpotsContent() {
  const raw = useSearchParams().get('section')
  // 값이 없거나 정의되지 않은 섹션이면 PEAK_NOW 로 폴백한다.
  const section: GetExploreSpotsSection =
    raw === GetExploreSpotsSection.NEXT_WEEK
      ? GetExploreSpotsSection.NEXT_WEEK
      : GetExploreSpotsSection.PEAK_NOW

  // 첫 페이지만 조회한다(페이지네이션 미구현).
  const { data, isLoading } = useExploreSpots({
    section,
    pageRequest: { page: 0, size: 50 },
  })
  const spots = data?.content ?? []

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={
            <div className="text-[15px] font-medium text-[#000000]">{SECTION_TITLE[section]}</div>
          }
        />
      </div>

      {!isLoading &&
        (spots.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="text-text-primary text-lg font-semibold">아직 보여드릴 스팟이 없어요</p>
            <p className="text-text-tertiary text-base">다음 개화 소식을 기다려주세요</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {spots.map((item) => (
              <SpotCard
                key={`${item.attractionId}-${item.category}`}
                spot={toExploreSpotProps(item)}
                favoriteSpotId={item.spotId ?? undefined}
                initialFavorite={item.favorited}
              />
            ))}
          </ul>
        ))}
    </div>
  )
}

// useSearchParams 는 App Router 에서 Suspense 경계가 필요하다.
export default function ExploreSpotsPage() {
  return (
    <Suspense fallback={null}>
      <ExploreSpotsContent />
    </Suspense>
  )
}
