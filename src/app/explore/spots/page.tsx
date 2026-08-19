'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { useExploreSpotsInfinite } from '@/api/facades/explore'
import { GetExploreSpotsSection } from '@/api/facades/generated/peakdaApi.schemas'
import { toExploreSpotProps } from '@/lib/utils/explore'
import { flattenPages } from '@/lib/utils/infinitePages'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useFilterStore } from '@/stores/useFilterStore'

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

  // 필터 드로어에서 고른 꽃 종류. 서버 category 는 값 하나만 받으므로 첫 번째만 보낸다.
  const category = useFilterStore((state) => state.applied.categories[0])

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExploreSpotsInfinite(section, category ?? undefined)
  const spots = flattenPages(data)
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)

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
          <>
            <ul className="divide-y divide-gray-100">
              {spots.map((item) => (
                <SpotCard
                  key={`${item.attractionId}-${item.category}`}
                  spot={toExploreSpotProps(item)}
                />
              ))}
            </ul>
            <InfiniteScrollFooter sentinelRef={sentinelRef} isLoading={isFetchingNextPage} />
          </>
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
