'use client'

import { useState } from 'react'
import Header from '@/components/ui/layout/Header'
import SearchInput from '@/app/search/_components/SearchInput'
import { ExplorCard, ExplorCardProps } from '@/components/ui/card/ExplorCard'
import SpotCard from '@/components/ui/card/SpotCard'
import { SPOTProps } from '@/app/search/_components/SpotPanel'
import Image from 'next/image'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { Drawer } from '@/components/ui/layout/Drawer'
import Nav from '@/components/ui/layout/Nav'

type PeakData = Extract<ExplorCardProps, { type: 'peak' }>
type FestivalData = Extract<ExplorCardProps, { type: 'festival' }>
type CourseData = Extract<ExplorCardProps, { type: 'course' }>

const PEAK_SPOTS: PeakData[] = [
  {
    type: 'peak',
    image: '/images/exploreEmpty.jpg',
    name: '여의도 한강공원',
    description: '서울 영등포구 · 2.4km',
    visitorCount: 120,
    bloomPercent: 89,
  },
  {
    type: 'peak',
    image: '/images/explore.png',
    name: '남산 숲길',
    description: '서울 용산구 · 1.8km',
    visitorCount: 85,
    bloomPercent: 75,
  },
  {
    type: 'peak',
    image: '/images/explore.png',
    name: '경주 불국사',
    description: '경북 경주시 · 324km',
    visitorCount: 200,
    bloomPercent: 95,
  },
  {
    type: 'peak',
    image: '/images/explore.png',
    name: '서울숲 벚꽃길',
    description: '서울 성동구 · 5.2km',
    visitorCount: 150,
    bloomPercent: 82,
  },
]

const UPCOMING_SPOTS: SPOTProps[] = [
  {
    id: 1,
    name: '경주 불국사 단풍',
    location: '경북 경주시',
    status: '이제 막요',
    nameList: ['단풍', '역사'],
  },
  {
    id: 2,
    name: '서울숲 벚꽃길',
    location: '서울 성동구',
    status: '빨리가요',
    nameList: ['벚꽃', '산책'],
  },
  {
    id: 3,
    name: '여의도 한강공원 벚꽃길',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['벚꽃', '한강'],
  },
  {
    id: 4,
    name: '부산 해운대 벚꽃축제',
    location: '부산 해운대구',
    status: '빨리가요',
    nameList: ['벚꽃', '축제'],
  },
]

const FESTIVAL_CARDS: FestivalData[] = [
  {
    type: 'festival',
    image: '/images/exploreEmpty.jpg',
    name: '진해 군항제',
    description: '경남 창원시 · 종료 D-3',
    dateRange: '3.28~4.7',
    status: '진행중',
  },
  {
    type: 'festival',
    image: '/images/exploreEmpty.jpg',
    name: '경주 벚꽃 축제',
    description: '경북 경주시 · 종료 D-5',
    dateRange: '3.30~4.9',
    status: '진행중',
  },
]

const COURSE_CARDS: CourseData[] = [
  {
    type: 'course',
    image: '/images/exploreEmpty.jpg',
    title: '도심 산책 4월 꽃길',
    subtitle: '경남 창원시 · 324km · 1시간',
  },
  {
    type: 'course',
    image: '/images/exploreEmpty.jpg',
    title: '봄 드라이브 코스',
    subtitle: '전북 전주시 · 180km · 2시간',
  },
]

interface SectionHeaderProps {
  title: string
  count?: number
  showAll?: boolean
}

function SectionHeader({ title, showAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-lg font-bold text-gray-900">{title}</span>
      <div className="flex items-center gap-1">
        {showAll && (
          <button className="text-text-secondary flex cursor-pointer items-center gap-0.5 text-sm">
            전체
          </button>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const hasQuery = query.trim().length > 0
  const { openFlowerFilterDrawer } = useDrawerStore()
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-xl font-semibold text-[#000000]">탐색</div>}
          right={
            <div className="flex items-center gap-1">
              <p className="text-text-secondary text-sm">필터</p>
              <button type="button" className="cursor-pointer" onClick={openFlowerFilterDrawer}>
                <Image src="./icons/filter.svg" alt="필터" width={24} height={24} />
              </button>
            </div>
          }
        />
      </div>

      <SearchInput query={query} hasQuery={hasQuery} setQuery={setQuery} />

      {/* 지금이 딱 좋아에요 */}
      <section className="mt-2">
        <SectionHeader title="지금이 딱 좋아에요" count={PEAK_SPOTS.length} showAll />
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
          {PEAK_SPOTS.map((card) => (
            <ExplorCard key={card.name} {...card} />
          ))}
        </div>
      </section>

      {/* 다음 주에 가면 좋을 곳 */}
      <section className="mt-2">
        <SectionHeader title="다음 주에 가면 좋을 곳" showAll />
        <ul className="divide-y divide-gray-100">
          {UPCOMING_SPOTS.map((spot) => (
            <SpotCard spot={spot} key={spot.id} />
          ))}
        </ul>
      </section>

      {/* 요즘 뜨는 축제 */}
      <section className="mt-2">
        <SectionHeader title="요즘 뜨는 축제" showAll />
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
          {FESTIVAL_CARDS.map((card) => (
            <ExplorCard key={card.name} {...card} />
          ))}
        </div>
      </section>

      {/* 이번 주말 어디로 갈까요? */}
      <section className="mt-2">
        <SectionHeader title="이번 주말 어디로 갈까요?" showAll />
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
          {COURSE_CARDS.map((card) => (
            <ExplorCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <Drawer />
      <Nav activeTab="explore" />
    </div>
  )
}
