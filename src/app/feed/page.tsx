'use client'

import Image from 'next/image'
import Header from '@/components/ui/layout/Header'
import Nav from '@/components/ui/layout/Nav'
import Category from '@/components/ui/category/Category'
import { FeedCard } from '@/components/ui/card/FeedCard'

const FEED_CATEGORIES = ['전체', '관심 식물', '팔로잉']

const MOCK_FEEDS = [
  {
    authorName: 'Nickname',
    location: '진해 경화역 공원',
    timeAgo: '2시간전',
    visitDate: '2026.05.28',
    statusLabel: '이르다',
    statusVariant: 'green' as const,
    images: ['/images/explore.png', '/images/explore.png'],
    flowers: [
      { emoji: '🌸', label: '벚꽃' },
      { emoji: '🌸', label: '진달래' },
    ],
    content: '아직 개화가 시작되지 않았지만, 산책로가 정말 예뻐요!',
    reactions: [
      { emoji: '❤️', count: 999 },
      { emoji: '😀', count: 999 },
    ],
    isOwner: false,
  },
  {
    authorName: 'FlowerLover',
    location: '여의도 한강공원',
    timeAgo: '5시간전',
    visitDate: '2026.05.27',
    statusLabel: '절정',
    statusVariant: 'bloom' as const,
    images: ['/images/explore.png'],
    flowers: [{ emoji: '🌸', label: '벚꽃' }],
    content: '벚꽃이 정말 절정이에요! 지금 바로 가세요.',
    reactions: [
      { emoji: '❤️', count: 234 },
      { emoji: '😀', count: 56 },
    ],
    isOwner: true,
  },
  {
    authorName: 'PeakUser',
    location: '남산 숲길',
    timeAgo: '1일전',
    visitDate: '2026.05.26',
    statusLabel: '막바지',
    statusVariant: 'secondary' as const,
    images: ['/images/explore.png', '/images/explore.png'],
    flowers: [
      { emoji: '🌿', label: '새싹' },
      { emoji: '🌸', label: '벚꽃' },
    ],
    content: '벚꽃이 거의 끝나가고 있어요. 마지막으로 보러 가기 좋아요.',
    reactions: [
      { emoji: '❤️', count: 88 },
      { emoji: '😀', count: 12 },
    ],
    isOwner: false,
  },
]

export default function FeedPage() {
  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-text-primary text-xl font-semibold">피드</div>}
          right={
            <div className="flex items-center gap-3">
              <Image src="/icons/search.svg" alt="검색" width={22} height={22} />
            </div>
          }
        />
      </div>

      {/* 카테고리 탭 */}
      <Category
        categories={FEED_CATEGORIES}
        className="border-border-primary bg-bg-primary sticky top-0 justify-start border-b px-4 py-2"
      />

      {/* 피드 목록 */}
      <div className="divide-border-primary divide-y">
        {MOCK_FEEDS.map((feed, i) => (
          <FeedCard key={i} {...feed} />
        ))}
      </div>

      <Nav activeTab="feed" />
    </div>
  )
}
