'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { SearchInput } from '@/app/search/_components/SearchInput'
import { ExplorCard } from '@/components/ui/card/ExplorCard'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useFilterStore } from '@/stores/useFilterStore'
import { Drawer } from '@/components/ui/layout/Drawer'
import { Nav } from '@/components/ui/layout/Nav'
import { useHomeSuggestion } from '@/api/facades/home'
import { useExploreCuration } from '@/api/facades/explore'
import type { ExploreSpotItem } from '@/api/facades/generated/peakdaApi.schemas'
import {
  formatMonthDay,
  toExploreSpotProps,
  toFestivalDateRange,
  toFestivalDescription,
  toFestivalStatus,
} from '@/lib/utils/explore'

// 탐색 응답에는 카드 이미지가 없는 항목이 있어 공통 플레이스홀더를 쓴다.
const PLACEHOLDER_IMAGE = '/images/exploreEmpty.jpg'

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
}

function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-lg font-bold text-gray-900">{title}</span>
      {href && (
        <Link
          href={href}
          className="text-text-secondary flex cursor-pointer items-center gap-0.5 text-sm"
        >
          전체
        </Link>
      )}
    </div>
  )
}

// 개화 시즌이 아니면 섹션이 통째로 비는 게 정상이라, 섹션 자체는 남기고 안내만 보여줌.
function EmptySection({ text }: { text: string }) {
  return <p className="text-text-tertiary px-4 py-8 text-center text-sm">{text}</p>
}

export default function ExplorePage() {
  const router = useRouter()
  const openFlowerFilterDrawer = useDrawerStore((s) => s.openFlowerFilterDrawer)
  const { data: suggestion } = useHomeSuggestion()
  // 필터 드로어에서 고른 꽃 종류. 서버 category 는 값 하나만 받으므로
  // 여러 개를 골랐으면 첫 번째만 보낸다(탐색은 지도처럼 클라 필터를 걸 목록이 없다).
  const category = useFilterStore((state) => state.applied.categories[0])

  // 절정/다음 주/축제/큐레이션 4개 섹션이 한 번에 내려온다.
  const { data: explore, isLoading } = useExploreCuration({ category: category ?? undefined })
  const peakNow = explore?.peakNow ?? []
  const nextWeek = explore?.nextWeek ?? []
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
          left={<div className="text-xl font-semibold text-[#000000]">탐색</div>}
          right={
            <div className="flex items-center gap-1">
              <p className="text-text-secondary text-sm">필터</p>
              <button type="button" className="cursor-pointer" onClick={openFlowerFilterDrawer}>
                <Image src="/icons/filter.svg" alt="필터" width={24} height={24} />
              </button>
            </div>
          }
        />
      </div>

      <SearchInput
        readOnly
        onClick={() => router.push('/search')}
        placeholder={searchPlaceholder}
      />

      {/* 지금이 절정이에요 */}
      <section className="mt-2">
        <SectionHeader
          title="지금이 절정이에요"
          href={peakNow.length > 0 ? '/explore/spots?section=PEAK_NOW' : undefined}
        />
        {peakNow.length === 0 ? (
          !isLoading && <EmptySection text="지금 절정인 명소가 없어요" />
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {peakNow.map((item) => (
              <Link
                key={`${item.attractionId}-${item.category}`}
                href={`/spot/${item.spotId}`}
                className="shrink-0"
              >
                <ExplorCard
                  type="peak"
                  image={item.thumbnailUrl ?? PLACEHOLDER_IMAGE}
                  name={item.name}
                  description={toPeakDescription(item)}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 다음 주에 가면 좋을 곳 */}
      <section className="mt-2">
        <SectionHeader
          title="다음 주에 가면 좋을 곳"
          href={nextWeek.length > 0 ? '/explore/spots?section=NEXT_WEEK' : undefined}
        />
        {nextWeek.length === 0 ? (
          !isLoading && <EmptySection text="다음 주에 개화가 예상되는 곳이 없어요" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {nextWeek.map((item) => (
              <SpotCard
                key={`${item.attractionId}-${item.category}`}
                spot={toExploreSpotProps(item)}
                favoriteSpotId={item.spotId ?? undefined}
                initialFavorite={item.favorited}
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
        />
        {festivals.length === 0 ? (
          !isLoading && <EmptySection text="진행 중인 축제가 없어요" />
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {festivals.map((item) => {
              const status = toFestivalStatus(item)
              return (
                <Link
                  key={item.festivalId}
                  href={`/festivals/${item.festivalId}`}
                  className="shrink-0"
                >
                  <ExplorCard
                    type="festival"
                    image={item.thumbnailUrl ?? PLACEHOLDER_IMAGE}
                    name={item.name}
                    description={toFestivalDescription(item)}
                    dateRange={toFestivalDateRange(item)}
                    status={status.label}
                    statusVariant={status.variant}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* 이번 주말 어디로 갈까요? — 에디터 큐레이션 */}
      <section className="mt-2">
        <SectionHeader title="이번 주말 어디로 갈까요?" />
        {curations.length === 0 ? (
          !isLoading && <EmptySection text="아직 발행된 큐레이션이 없어요" />
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {curations.map((item) => (
              <Link key={item.id} href={`/creators/${item.id}`} className="shrink-0">
                <ExplorCard
                  type="course"
                  image={item.heroImageUrl ?? PLACEHOLDER_IMAGE}
                  title={item.title}
                  subtitle={item.subtitle ?? item.weekLabel}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      <Drawer />
      <Nav activeTab="explore" />
    </div>
  )
}
