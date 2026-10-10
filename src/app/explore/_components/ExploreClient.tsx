'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/ui/layout/Header'
import { SearchInput } from '@/app/search/_components/SearchInput'
import { ExplorCard } from '@/components/ui/card/ExplorCard'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { Carousel, CarouselItem } from '@/components/ui/display/Carousel'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useFilterStore } from '@/stores/useFilterStore'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { Nav } from '@/components/ui/layout/Nav'
import { QueryFeedback } from '@/components/ui/display/QueryFeedback'
import { useHomeSuggestion } from '@/api/facades/home'
import { useExploreCuration } from '@/api/facades/explore'
import type { ExploreResponse, ExploreSpotItem } from '@/api/facades/generated/peakdaApi.schemas'
import { track, type ExploreSection } from '@/lib/analytics'
import {
  formatMonthDay,
  hasSpotId,
  toExploreSpotProps,
  toFestivalDateRange,
  toFestivalDescription,
  toFestivalStatus,
} from '@/lib/utils/explore'

// 탐색 응답에는 카드 이미지가 없는 항목이 있어 공통 플레이스홀더를 쓴다.
const PLACEHOLDER_IMAGE = '/images/exploreEmpty.jpg'

// 카드 폭이 72% 라 캐러셀마다 첫 화면에 2장(1장 + 2번째 일부)이 보인다. 이 2장만 이미지를 먼저 받고,
// 나머지는 넘겨서 화면에 들어올 때 받는다 — 절정 4번째 카드의 관광공사 BMP(약 1MB)를 안 보이는데 받던 문제.
const EAGER_CARD_IMAGES = 2

// 절정 카드 설명: '벚꽃 · 4.1~4.14'. 절정 기간이 없으면 꽃 종류만 보여준다.
const toPeakDescription = (item: ExploreSpotItem) => {
  const period =
    item.peakStartDate && item.peakEndDate
      ? `${formatMonthDay(item.peakStartDate)}~${formatMonthDay(item.peakEndDate)}`
      : null
  return [item.displayName, period].filter(Boolean).join(' · ')
}

interface SectionHeaderProps {
  title: string
  // 전체 보기 페이지가 있는 섹션만 넘긴다.
  href?: string
  section?: ExploreSection
}

function SectionHeader({ title, href, section }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {href && (
        <Link
          href={href}
          onClick={() => section && track('explore_see_all', { section })}
          className="text-text-secondary flex cursor-pointer items-center gap-0.5 text-sm"
        >
          전체
        </Link>
      )}
    </div>
  )
}

// 개화 시즌이 아니면 섹션이 통째로 비는 게 정상이라, 섹션 자체는 남기고 안내만 보여줌.
// 어느 섹션의 몇 번째(0부터) 카드가 눌리는지 본다. 상세가 없는 항목(id 없음)은 링크도 없어 보내지 않는다.
function trackCardClick(section: ExploreSection, itemId: number | null | undefined, position: number) {
  if (itemId == null) return
  track('explore_card_click', { section, item_id: itemId, position, view: 'main' })
}

function EmptySection({ text }: { text: string }) {
  return <p className="text-text-tertiary px-4 py-8 text-center text-sm">{text}</p>
}

interface ExploreClientProps {
  // 서버에서 받은 비로그인 기준 첫 응답. 조회 실패(빌드 중 API 장애 등)면 null 이고 클라이언트가 다시 조회한다.
  initialExplore: ExploreResponse | null
}

export function ExploreClient({ initialExplore }: ExploreClientProps) {
  const openFlowerFilterDrawer = useDrawerStore((s) => s.openFlowerFilterDrawer)
  const { data: suggestion } = useHomeSuggestion()
  // 필터 드로어에서 고른 꽃 종류. 서버 category 는 값 하나만 받으므로
  // 여러 개를 골랐으면 첫 번째만 보낸다(탐색은 지도처럼 클라 필터를 걸 목록이 없다).
  const category = useFilterStore((state) => state.applied.categories[0])

  // 절정/다음 주/축제/큐레이션 4개 섹션이 한 번에 내려온다.
  const {
    data: explore,
    isLoading,
    isError,
    refetch,
  } = useExploreCuration(
    { category: category ?? undefined },
    // 서버 응답은 필터 없는 조회라, 지도에서 꽃 필터를 고른 채 들어왔으면 쓰지 않는다.
    category ? undefined : (initialExplore ?? undefined)
  )
  const peakNow = (explore?.peakNow ?? []).filter(hasSpotId)
  const nextWeek = (explore?.nextWeek ?? []).filter(hasSpotId)
  const festivals = explore?.festivals ?? []
  const curations = explore?.curations ?? []

  const searchPlaceholder =
    suggestion?.available && suggestion.message
      ? suggestion.message
      : '스팟, 지역, 식물을 검색해보세요.'

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white pb-24">
      <div className="h-14">
        <Header
          left={<h1 className="text-xl font-semibold text-[#000000]">탐색</h1>}
          right={
            <div className="flex items-center gap-1">
              <p className="text-text-secondary text-sm">필터</p>
              <button
                type="button"
                aria-label="꽃 필터 열기"
                className="cursor-pointer"
                onClick={() => {
                  track('filter_open', { surface: 'explore' })
                  openFlowerFilterDrawer()
                }}
              >
                <Image src="/icons/filter.svg" alt="필터" width={24} height={24} />
              </button>
            </div>
          }
        />
      </div>

      <SearchInput href="/search" placeholder={searchPlaceholder} />

      {isLoading && <QueryFeedback state="loading" />}
      {isError && !explore && <QueryFeedback state="error" onRetry={() => void refetch()} />}

      {!isLoading && (!isError || explore) && (
        <>
          {/* 지금이 절정이에요 */}
          <section className="mt-2">
            <SectionHeader
              title="지금이 절정이에요"
              href={peakNow.length > 0 ? '/explore/spots?section=PEAK_NOW' : undefined}
              section="peak_now"
            />
            {peakNow.length === 0 ? (
              <EmptySection text="지금 절정인 명소가 없어요" />
            ) : (
              <Carousel className="px-4 pb-4" eagerImageCount={EAGER_CARD_IMAGES}>
                {peakNow.map((item, idx) => (
                  <CarouselItem
                    key={`${item.attractionId}-${item.category}`}
                    className="flex-[0_0_72%] pr-3"
                  >
                    <Link
                      href={`/spot/${item.spotId}`}
                      onClick={() => trackCardClick('peak_now', item.spotId, idx)}
                      className="block"
                    >
                      {/* 카드 폭이 72% 라 첫 화면에는 1장 + 2번째 일부가 보인다. */}
                      <ExplorCard
                        type="peak"
                        priority={idx < 2}
                        className="w-full"
                        image={item.thumbnailUrl ?? PLACEHOLDER_IMAGE}
                        name={item.name}
                        description={toPeakDescription(item)}
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </Carousel>
            )}
          </section>

          {/* 다음 주에 가면 좋을 곳 */}
          <section className="mt-2">
            <SectionHeader
              title="다음 주에 가면 좋을 곳"
              href={nextWeek.length > 0 ? '/explore/spots?section=NEXT_WEEK' : undefined}
              section="next_week"
            />
            {nextWeek.length === 0 ? (
              <EmptySection text="다음 주에 개화가 예상되는 곳이 없어요" />
            ) : (
              <ul className="divide-y divide-gray-100">
                {nextWeek.map((item, idx) => (
                  <SpotCard
                    key={`${item.attractionId}-${item.category}`}
                    spot={toExploreSpotProps(item)}
                    onOpen={() => trackCardClick('next_week', item.spotId, idx)}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* 요즘 뜨는 축제 */}
          <section className="mt-2">
            <SectionHeader
              title="요즘 뜨는 축제"
              href={festivals.length > 0 ? '/explore/festivals' : undefined}
              section="festival"
            />
            {festivals.length === 0 ? (
              <EmptySection text="진행 중인 축제가 없어요" />
            ) : (
              <Carousel className="px-4 pb-4" eagerImageCount={EAGER_CARD_IMAGES}>
                {festivals.map((item, idx) => {
                  const status = toFestivalStatus(item)
                  return (
                    <CarouselItem key={item.festivalId} className="flex-[0_0_72%] pr-3">
                      <Link
                        href={`/festivals/${item.festivalId}`}
                        onClick={() => trackCardClick('festival', item.festivalId, idx)}
                        className="block"
                      >
                        <ExplorCard
                          type="festival"
                          className="w-full"
                          image={item.thumbnailUrl ?? PLACEHOLDER_IMAGE}
                          name={item.name}
                          description={toFestivalDescription(item)}
                          dateRange={toFestivalDateRange(item)}
                          status={status.label}
                          statusVariant={status.variant}
                        />
                      </Link>
                    </CarouselItem>
                  )
                })}
              </Carousel>
            )}
          </section>

          {/* 이번 주말 어디로 갈까요? — 에디터 큐레이션 */}
          <section className="mt-2">
            <SectionHeader title="이번 주말 어디로 갈까요?" />
            {curations.length === 0 ? (
              <EmptySection text="아직 발행된 큐레이션이 없어요" />
            ) : (
              // 시안대로 다음 카드가 살짝 보이게 두어 더 있다는 걸 알린다(슬라이드 폭 72%).
              <Carousel className="px-4 pb-4" eagerImageCount={EAGER_CARD_IMAGES}>
                {curations.map((item, idx) => (
                  <CarouselItem key={item.id} className="flex-[0_0_72%] pr-3">
                    <Link
                      href={`/creators/${item.id}`}
                      onClick={() => trackCardClick('creator', item.id, idx)}
                      className="block"
                    >
                      <ExplorCard
                        type="course"
                        className="w-full"
                        image={item.heroImageUrl ?? PLACEHOLDER_IMAGE}
                        title={item.title}
                        subtitle={item.subtitle ?? item.weekLabel}
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </Carousel>
            )}
          </section>
        </>
      )}

      <LazyDrawer />
      <Nav activeTab="explore" />
    </div>
  )
}
