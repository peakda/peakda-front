'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { getMockSpot, MOCK_SPOT_FEEDS } from '@/app/spot/[id]/_data'

export default function SpotFeedPage() {
  const { id } = useParams<{ id: string }>()
  const spot = getMockSpot(id)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">{spot.name} 피드</div>}
        />
      </div>

      <div className="divide-border-primary divide-y">
        {MOCK_SPOT_FEEDS.map((feed, i) => (
          <FeedCard key={i} {...feed} />
        ))}
      </div>
    </div>
  )
}
