'use client'

import { useRef, useState } from 'react'
import { Tabs } from '../Tab/Tab'
import { TabPanels } from '../Tab/TabPanel'
import FilterCard from '../card/FilterCard'
import FlowerCard from '../card/FlowerCard'
import { TabItem, useTabsContext } from '@/context/TabContext'

const TABS: TabItem[] = [
  { value: 'region', label: '지역' },
  { value: 'timing', label: '시기' },
  { value: 'flowers', label: '꽃 종류' },
]

const REGIONS = [
  { title: '수도권', subTitle: '서울 · 경기 · 인천 등' },
  { title: '강원도', subTitle: '강릉 · 속초 · 춘천 등' },
  { title: '충청도', subTitle: '대전 · 공주 · 천안 등' },
  { title: '경상도', subTitle: '부산 · 경주 · 진해 등' },
  { title: '전라도', subTitle: '광주 · 전주 · 순천 등' },
  { title: '제주도', subTitle: '제주 · 서귀포' },
]

const TIMINGS = [
  { title: '절정', subTitle: '지금 피크에요!' },
  { title: '피기시작', subTitle: '1~2주 내 절정' },
  { title: '이르다', subTitle: '미리 계획 중' },
]

const SPRING_FLOWERS = [
  { label: '매화', date: '1-2월', image: '/flowers/plum.svg' },
  { label: '동백꽃', date: '11-3월', image: '/flowers/camellia.svg' },
  { label: '벚꽃', date: '3-4월', image: '/flowers/cherry-blossom.svg' },
  { label: '개나리', date: '3-4월', image: '/flowers/forsythia.svg' },
  { label: '진달래', date: '3-4월', image: '/flowers/azalea.svg' },
  { label: '유채꽃', date: '4-5월', image: '/flowers/canola.svg' },
  { label: '철쭉', date: '4-5월', image: '/flowers/royal-azalea.svg' },
]

const SUMMER_FLOWERS = [
  { label: '해바라기', date: '7-9월', image: '/flowers/sunflower.svg' },
  { label: '수국', date: '6-8월', image: '/flowers/hydrangea.svg' },
  { label: '연꽃', date: '7-8월', image: '/flowers/lotus.svg' },
]

const FALL_FLOWERS = [
  { label: '코스모스', date: '9-10월', image: '/flowers/cosmos.svg' },
  { label: '국화', date: '9-11월', image: '/flowers/cherry-blossom.svg' },
  { label: '단풍', date: '10-11월', image: '/flowers/maple.svg' },
  { label: '억새', date: '9-11월', image: '/flowers/cherry-blossom.svg' },
]

function SwipeableContent({
  children,
  snap,
  onExpandToFull,
}: {
  children: React.ReactNode
  snap: string | number | null
  onExpandToFull: () => void
}) {
  const { active, setActive } = useTabsContext()
  const touchStart = useRef({ x: 0, y: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const snapPx =
    typeof snap === 'string'
      ? parseInt(snap)
      : typeof snap === 'number' && snap <= 1
        ? Math.round(snap * (typeof window !== 'undefined' ? window.innerHeight : 800))
        : typeof snap === 'number'
          ? snap
          : 400

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y

    // 수평 스와이프 → 탭 전환
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      const currentIndex = TABS.findIndex((t) => t.value === active)
      if (dx < 0 && currentIndex < TABS.length - 1) {
        setActive(TABS[currentIndex + 1].value)
      } else if (dx > 0 && currentIndex > 0) {
        setActive(TABS[currentIndex - 1].value)
      }
      return
    }

    // 스크롤 최상단에서 위로 스와이프 → 650px 확장
    const isAtTop = (scrollRef.current?.scrollTop ?? 1) === 0
    if (dy < -60 && Math.abs(dy) > Math.abs(dx) && isAtTop && snap === '400px') {
      onExpandToFull()
    }
  }

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4 pt-0 pb-24"
      style={{ maxHeight: `${snapPx - 72}px` }}
      data-vaul-no-drag
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

interface FilterDrawerContentProps {
  snap: string | number | null
  onExpandToFull: () => void
  flowersOnly?: boolean
}

export function FilterDrawerContent({
  snap,
  onExpandToFull,
  flowersOnly = false,
}: FilterDrawerContentProps) {
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [selectedTimings, setSelectedTimings] = useState<Set<string>>(new Set())
  const [selectedFlowers, setSelectedFlowers] = useState<Set<string>>(new Set())
  const touchStart = useRef({ x: 0, y: 0 })

  function toggle(set: Set<string>, value: string): Set<string> {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const snapPx =
    typeof snap === 'string'
      ? parseInt(snap)
      : typeof snap === 'number' && snap <= 1
        ? Math.round(snap * (typeof window !== 'undefined' ? window.innerHeight : 800))
        : typeof snap === 'number'
          ? snap
          : 400

  if (flowersOnly) {
    return (
      <div
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4 pb-24"
        style={{ maxHeight: `${snapPx - 30}px` }}
        data-vaul-no-drag
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }}
        onTouchEnd={(e) => {
          const dy = e.changedTouches[0].clientY - touchStart.current.y
          if (dy < -60 && snap === '400px') onExpandToFull()
        }}
      >
        <div className="space-y-6">
          <div>
            <p className="text-text-secondary mb-1 font-semibold">봄</p>
            <div className="grid grid-cols-4 gap-2">
              {SPRING_FLOWERS.map((f) => (
                <FlowerCard
                  key={f.label}
                  label={f.label}
                  date={f.date}
                  image={f.image}
                  selected={selectedFlowers.has(f.label)}
                  onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-secondary mb-1 font-semibold">여름</p>
            <div className="grid grid-cols-4 gap-3">
              {SUMMER_FLOWERS.map((f) => (
                <FlowerCard
                  key={f.label}
                  label={f.label}
                  date={f.date}
                  image={f.image}
                  selected={selectedFlowers.has(f.label)}
                  onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-secondary mb-1 font-semibold">가을 · 겨울</p>
            <div className="grid grid-cols-4 gap-3">
              {FALL_FLOWERS.map((f) => (
                <FlowerCard
                  key={f.label}
                  label={f.label}
                  date={f.date}
                  image={f.image}
                  selected={selectedFlowers.has(f.label)}
                  onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Tabs
      defaultValue="region"
      tabs={TABS}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <SwipeableContent snap={snap} onExpandToFull={onExpandToFull}>
        <TabPanels tabs={TABS} className="min-h-0 flex-1">
          <div>
            <p className="text-text-secondary mb-1 font-semibold">권역 선택</p>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <FilterCard
                  key={r.title}
                  title={r.title}
                  subTitle={r.subTitle}
                  isActive={selectedRegions.has(r.title)}
                  onClick={() => setSelectedRegions(toggle(selectedRegions, r.title))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-text-secondary mb-1 font-semibold">지금 상태</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMINGS.map((t) => (
                <FilterCard
                  key={t.title}
                  title={t.title}
                  subTitle={t.subTitle}
                  isActive={selectedTimings.has(t.title)}
                  onClick={() => setSelectedTimings(toggle(selectedTimings, t.title))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-text-secondary mb-1 font-semibold">봄</p>
              <div className="grid grid-cols-4 gap-2">
                {SPRING_FLOWERS.map((f) => (
                  <FlowerCard
                    key={f.label}
                    label={f.label}
                    date={f.date}
                    image={f.image}
                    selected={selectedFlowers.has(f.label)}
                    onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-1 font-semibold">여름</p>
              <div className="grid grid-cols-4 gap-3">
                {SUMMER_FLOWERS.map((f) => (
                  <FlowerCard
                    key={f.label}
                    label={f.label}
                    date={f.date}
                    image={f.image}
                    selected={selectedFlowers.has(f.label)}
                    onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-1 font-semibold">가을 · 겨울</p>
              <div className="grid grid-cols-4 gap-3">
                {FALL_FLOWERS.map((f) => (
                  <FlowerCard
                    key={f.label}
                    label={f.label}
                    date={f.date}
                    image={f.image}
                    selected={selectedFlowers.has(f.label)}
                    onClick={() => setSelectedFlowers(toggle(selectedFlowers, f.label))}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabPanels>
      </SwipeableContent>
    </Tabs>
  )
}
