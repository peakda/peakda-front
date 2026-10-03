'use client'

import Link from 'next/link'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { ExplorCard } from '@/components/ui/card/ExplorCard'
import { useExploreFestivals } from '@/api/facades/explore'
import type { ExploreFestivalListResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { toFestivalDateRange, toFestivalDescription, toFestivalStatus } from '@/lib/utils/explore'
import { track } from '@/lib/analytics'

interface ExploreFestivalsClientProps {
  // 서버에서 받은 첫 응답. 조회 실패(빌드 중 API 장애 등)면 null 이고 클라이언트가 다시 조회한다.
  initialFestivals: ExploreFestivalListResponse | null
}

export function ExploreFestivalsClient({ initialFestivals }: ExploreFestivalsClientProps) {
  // 진행 중 축제는 페이징 없이 전량 내려온다.
  const { data, isLoading } = useExploreFestivals(undefined, initialFestivals ?? undefined)
  const festivals = data?.items ?? []

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">요즘 뜨는 축제</div>}
        />
      </div>

      {!isLoading &&
        (festivals.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="text-text-primary text-lg font-semibold">진행 중인 축제가 없어요</p>
            <p className="text-text-tertiary text-base">다음 축제 소식을 기다려주세요</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 px-4 pb-4">
            {festivals.map((item, idx) => {
              const status = toFestivalStatus(item)
              return (
                <li key={item.festivalId}>
                  <Link
                    href={`/festivals/${item.festivalId}`}
                    onClick={() =>
                      track('explore_card_click', {
                        section: 'festival',
                        item_id: item.festivalId,
                        position: idx,
                        view: 'list',
                      })
                    }
                  >
                    {/* 카드 기본 폭(w-60)은 탐색 홈 슬라이더용이라 세로 목록에서는 화면 폭에 맞춘다 */}
                    <ExplorCard
                      className="w-full"
                      type="festival"
                      image={item.thumbnailUrl ?? '/images/exploreEmpty.jpg'}
                      name={item.name}
                      description={toFestivalDescription(item)}
                      dateRange={toFestivalDateRange(item)}
                      status={status.label}
                      statusVariant={status.variant}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
    </div>
  )
}
