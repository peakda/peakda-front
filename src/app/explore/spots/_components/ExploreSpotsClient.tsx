'use client'

import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { shouldLoadMore } from '@/lib/utils/myRecords'
import { QueryFeedback } from '@/components/ui/display/QueryFeedback'
import { useExploreSpotsInfinite } from '@/api/facades/explore'
import type {
  GetExploreSpotsSection,
  PageResponseExploreSpotItem,
} from '@/api/facades/generated/peakdaApi.schemas'
import { hasSpotId, toExploreSpotProps } from '@/lib/utils/explore'
import { flattenPages } from '@/lib/utils/infinitePages'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useFilterStore } from '@/stores/useFilterStore'
import { track, type ExploreSection } from '@/lib/analytics'

const ANALYTICS_SECTION: Record<GetExploreSpotsSection, ExploreSection> = {
  PEAK_NOW: 'peak_now',
  NEXT_WEEK: 'next_week',
}

const SECTION_TITLE: Record<GetExploreSpotsSection, string> = {
  PEAK_NOW: '지금이 절정이에요',
  NEXT_WEEK: '다음 주에 가면 좋을 곳',
}

interface ExploreSpotsClientProps {
  // 서버가 ?section 을 해석한 값
  section: GetExploreSpotsSection
  // 서버에서 받은 첫 페이지. 조회 실패(API 장애 등)면 null 이고 클라이언트가 다시 조회한다.
  initialPage: PageResponseExploreSpotItem | null
}

export function ExploreSpotsClient({ section, initialPage }: ExploreSpotsClientProps) {
  // 필터 드로어에서 고른 꽃 종류. 서버 category 는 값 하나만 받으므로 첫 번째만 보낸다.
  const category = useFilterStore((state) => state.applied.categories[0])

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useExploreSpotsInfinite(
    section,
    category ?? undefined,
    // 서버 응답은 필터 없는 조회라, 꽃 필터를 고른 채 들어왔으면 쓰지 않는다.
    category ? undefined : (initialPage ?? undefined)
  )
  const spots = flattenPages(data).filter(hasSpotId)
  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    shouldLoadMore(hasNextPage, isFetchingNextPage, isFetchNextPageError)
  )

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

      {isLoading ? (
        <QueryFeedback state="loading" />
      ) : isError && spots.length === 0 ? (
        <QueryFeedback state="error" onRetry={() => void refetch()} />
      ) : spots.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
          <p className="text-text-primary text-lg font-semibold">아직 보여드릴 스팟이 없어요</p>
          <p className="text-text-tertiary text-base">다음 개화 소식을 기다려주세요</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            {spots.map((item, idx) => (
              <SpotCard
                key={`${item.attractionId}-${item.category}`}
                spot={toExploreSpotProps(item)}
                onOpen={() =>
                  item.spotId != null &&
                  track('explore_card_click', {
                    section: ANALYTICS_SECTION[section],
                    item_id: item.spotId,
                    position: idx,
                    view: 'list',
                  })
                }
              />
            ))}
          </ul>
          <InfiniteScrollFooter
            sentinelRef={sentinelRef}
            isLoading={isFetchingNextPage}
            onRetry={isFetchNextPageError ? () => void fetchNextPage() : undefined}
          />
        </>
      )}
      <LazyDrawer />
    </div>
  )
}
