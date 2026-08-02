'use client'

import Link from 'next/link'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { ExplorCard } from '@/components/ui/card/ExplorCard'
import { useExploreFestivals } from '@/api/facades/explore'
import { toFestivalDateRange, toFestivalDescription } from '@/lib/utils/explore'

export default function ExploreFestivalsPage() {
  // 진행 중 축제는 페이징 없이 전량 내려온다.
  const { data, isLoading } = useExploreFestivals()
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
          <ul className="flex flex-col items-center gap-4 px-4 pb-4">
            {festivals.map((item) => (
              <li key={item.festivalId}>
                <Link href={`/festivals/${item.festivalId}`}>
                  <ExplorCard
                    type="festival"
                    image="/images/exploreEmpty.jpg"
                    name={item.name}
                    description={toFestivalDescription(item)}
                    dateRange={toFestivalDateRange(item)}
                    status="진행중"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
