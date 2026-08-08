'use client'

import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { MyFeed } from '@/app/my/_components/MyFeed'
import { useMySpotRecordsInfinite } from '@/api/facades/spot-record'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { flattenPages } from '@/lib/utils/infinitePages'
import { displayCount, shouldLoadMore } from '@/lib/utils/myRecords'
import { toMyRecordThumb } from '@/lib/utils/spotRecordToFeed'

// 마이 화면의 "내 기록" 미리보기(상위 6건)에서 넘어오는 전체보기.
// 미리보기는 MyPageResponse.recordPreview, 더보기는 스팟 기록 리스트 API를 쓴다(스키마 주석 기준).
export default function MyRecordsPage() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMySpotRecordsInfinite('PUBLISHED')
  const records = flattenPages(data).map(toMyRecordThumb)
  const total = displayCount(data?.pages[0]?.totalElements, records.length)
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    shouldLoadMore(hasNextPage, isFetchingNextPage)
  )

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">내 기록({total})</div>}
        />
      </div>

      {!isLoading &&
        (records.length === 0 ? (
          <p className="text-text-tertiary py-12 text-center text-sm">아직 기록이 없어요</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 px-4">
            {records.map((record, idx) => (
              <MyFeed key={idx} {...record} />
            ))}
          </div>
        ))}

      <div ref={sentinelRef} />
    </div>
  )
}
