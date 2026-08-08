'use client'

import { useRef } from 'react'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { FilterCard } from '@/components/ui/card/FilterCard'
import { FlowerCard } from '@/components/ui/card/FlowerCard'
import { TabItem, useTabsContext } from '@/context/TabContext'
import { FLOWER_CATEGORIES, type FlowerSeason } from '@/constants/flower'
import { useFilterStore } from '@/stores/useFilterStore'
import type { BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

// 지역 탭은 서버 파라미터도, 클라에서 판정할 근거(권역 정보)도 없어 제외했다.
const TABS: TabItem[] = [
  { value: 'timing', label: '시기' },
  { value: 'flowers', label: '꽃 종류' },
]

// 개화 상태는 서버 파라미터가 없어 클라이언트에서 거른다. 복수 선택.
const TIMINGS: { status: BloomSlotStatus; title: string; subTitle: string }[] = [
  { status: 'PEAK', title: '절정', subTitle: '지금 피크에요!' },
  { status: 'STARTED', title: '피기시작', subTitle: '1~2주 내 절정' },
  { status: 'PREPARING', title: '이르다', subTitle: '미리 계획 중' },
]

const FLOWER_SEASONS: { season: FlowerSeason; label: string }[] = [
  { season: 'SPRING', label: '봄' },
  { season: 'SUMMER', label: '여름' },
  { season: 'FALL', label: '가을 · 겨울' },
]

// 꽃 종류는 서버 category 파라미터가 단일 값이라 단일 선택이다.
function FlowerSections() {
  const category = useFilterStore((s) => s.category)
  const setCategory = useFilterStore((s) => s.setCategory)

  return (
    <div className="space-y-6">
      {FLOWER_SEASONS.map(({ season, label }) => (
        <div key={season}>
          <p className="text-text-secondary mb-1 font-semibold">{label}</p>
          <div className="grid grid-cols-4 gap-2">
            {FLOWER_CATEGORIES.filter((f) => f.season === season).map((f) => (
              <FlowerCard
                key={f.value}
                label={f.label}
                date={f.months}
                image={f.image}
                selected={category === f.value}
                onClick={() => setCategory(f.value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

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
  // 드로어를 닫아도 선택이 유지돼야 해서 로컬 state 가 아닌 전역 필터 스토어를 쓴다.
  const statuses = useFilterStore((s) => s.statuses)
  const toggleStatus = useFilterStore((s) => s.toggleStatus)
  const touchStart = useRef({ x: 0, y: 0 })

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
        <FlowerSections />
      </div>
    )
  }

  return (
    <Tabs
      defaultValue="timing"
      tabs={TABS}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <SwipeableContent snap={snap} onExpandToFull={onExpandToFull}>
        <TabPanels tabs={TABS} className="min-h-0 flex-1">
          <div>
            <p className="text-text-secondary mb-1 font-semibold">지금 상태</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMINGS.map((t) => (
                <FilterCard
                  key={t.status}
                  title={t.title}
                  subTitle={t.subTitle}
                  isActive={statuses.includes(t.status)}
                  onClick={() => toggleStatus(t.status)}
                />
              ))}
            </div>
          </div>

          <FlowerSections />
        </TabPanels>
      </SwipeableContent>
    </Tabs>
  )
}
