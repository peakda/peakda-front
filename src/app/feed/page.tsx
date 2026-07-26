'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/ui/layout/Header'
import { Nav } from '@/components/ui/layout/Nav'
import { CategoryChip } from '@/components/ui/category/CategoryChip'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { useFeedList } from '@/api/facades/feed'
import { filterFromTab } from '@/lib/utils/feed'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'

const FEED_CATEGORIES = ['전체', '관심 식물', '팔로잉']

export default function FeedPage() {
  const router = useRouter()
  const [tab, setTab] = useState(FEED_CATEGORIES[0])

  const { data, isLoading } = useFeedList({
    filter: filterFromTab(tab),
    pageRequest: { page: 0, size: 20 },
  })
  const records = data?.content ?? []

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-text-primary text-xl font-semibold">피드</div>}
          right={
            <div className="flex items-center gap-3">
              <button type="button" aria-label="검색" className="cursor-pointer" onClick={() => router.push('/search')}>
                <Image src="/icons/search.svg" alt="검색" width={22} height={22} />
              </button>
            </div>
          }
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="border-border-primary bg-bg-primary sticky top-0 z-10 flex gap-1 border-b px-4 py-2">
        {FEED_CATEGORIES.map((cate) => (
          <CategoryChip
            key={cate}
            label={cate}
            selected={tab}
            onClick={() => setTab(cate)}
            className="w-auto px-3"
          />
        ))}
      </div>

      {/* 피드 목록 */}
      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : records.length === 0 ? (
        <p className="text-text-tertiary py-10 text-center text-sm">아직 피드가 없어요</p>
      ) : (
        <div className="divide-border-primary divide-y">
          {records.map((record) => (
            <FeedCard
              key={record.id}
              {...toFeedCardProps(record)}
              onOpen={() => router.push(`/feed/${record.id}`)}
            />
          ))}
        </div>
      )}

      <Nav activeTab="feed" />
    </div>
  )
}
