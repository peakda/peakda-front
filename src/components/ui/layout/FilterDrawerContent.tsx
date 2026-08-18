'use client'

import { useEffect, useRef } from 'react'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { Button } from '@/components/ui/button/Button'
import { FilterCard } from '@/components/ui/card/FilterCard'
import { FlowerCard } from '@/components/ui/card/FlowerCard'
import { TabItem, useTabsContext } from '@/context/TabContext'
import { FLOWER_CATEGORIES, type FlowerSeason } from '@/constants/flower'
import { REGIONS } from '@/constants/region'
import { TIMINGS } from '@/lib/utils/timing'
import { hasActiveFilter, useFilterStore } from '@/stores/useFilterStore'

const TABS: TabItem[] = [
  { value: 'region', label: '지역' },
  { value: 'timing', label: '시기' },
  { value: 'flowers', label: '꽃 종류' },
]

const FLOWER_SEASONS: { season: FlowerSeason; label: string }[] = [
  { season: 'SPRING', label: '봄' },
  { season: 'SUMMER', label: '여름' },
  { season: 'FALL', label: '가을 · 겨울' },
]

/**
 * 섹션 라벨 줄. 각 탭의 첫 줄에는 오른쪽 끝에 초기화 버튼을 같이 놓는다.
 *
 * 초기화도 draft 단계라 하단 버튼을 눌러야 실제로 필터가 풀린다.
 * 고른 게 없으면 비활성 — 숨기면 첫 선택에서 라벨 줄 높이가 튄다.
 */
function SectionLabel({ label, withReset = false }: { label: string; withReset?: boolean }) {
  const canReset = useFilterStore((s) => hasActiveFilter(s.draft))
  const resetDraft = useFilterStore((s) => s.resetDraft)

  return (
    <div className="mb-1 flex items-center justify-between">
      <p className="text-text-secondary font-semibold">{label}</p>
      {withReset && (
        // -mr-3 으로 Button 의 좌우 패딩을 상쇄해 글자가 콘텐츠 오른쪽 끝에 맞는다.
        <Button
          variant="ghost"
          size="sm"
          className="-mr-3"
          disabled={!canReset}
          onClick={resetDraft}
        >
          초기화
        </Button>
      )}
    </div>
  )
}

// 꽃 종류는 서버로 보내지 않고 응답의 category 로 클라에서 거른다(MapContainer 의 bloomParams 참고).
function FlowerSections() {
  const categories = useFilterStore((s) => s.draft.categories)
  const toggleDraftCategory = useFilterStore((s) => s.toggleDraftCategory)

  return (
    <div className="space-y-6">
      {FLOWER_SEASONS.map(({ season, label }, i) => (
        <div key={season}>
          <SectionLabel label={label} withReset={i === 0} />
          <div className="grid grid-cols-4 gap-2">
            {FLOWER_CATEGORIES.filter((f) => f.season === season).map((f) => (
              <FlowerCard
                key={f.value}
                label={f.label}
                date={f.months}
                image={f.image}
                selected={categories.includes(f.value)}
                onClick={() => toggleDraftCategory(f.value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 하단 버튼 라벨이 탭마다 달라서(꽃 종류만 'N개의 명소 보기') 활성 탭을 드로어로 올려준다.
function ActiveTabReporter({ onChange }: { onChange: (tab: string) => void }) {
  const { active } = useTabsContext()

  useEffect(() => {
    onChange(active)
  }, [active, onChange])

  return null
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
  onTabChange?: (tab: string) => void
}

export function FilterDrawerContent({
  snap,
  onExpandToFull,
  flowersOnly = false,
  onTabChange,
}: FilterDrawerContentProps) {
  // 여기서 고르는 값은 draft 일 뿐이다. 하단 버튼을 눌러야 applied 가 되고,
  // 지도를 눌러 그냥 닫으면 버려진다.
  const timing = useFilterStore((s) => s.draft.timing)
  const toggleDraftTiming = useFilterStore((s) => s.toggleDraftTiming)
  const region = useFilterStore((s) => s.draft.region)
  const toggleDraftRegion = useFilterStore((s) => s.toggleDraftRegion)
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
      defaultValue="region"
      tabs={TABS}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {onTabChange && <ActiveTabReporter onChange={onTabChange} />}
      <SwipeableContent snap={snap} onExpandToFull={onExpandToFull}>
        <TabPanels tabs={TABS} className="min-h-0 flex-1">
          <div>
            <SectionLabel label="권역 선택" withReset />
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <FilterCard
                  key={r.key}
                  title={r.label}
                  subTitle={r.subLabel}
                  isActive={region === r.key}
                  onClick={() => toggleDraftRegion(r.key)}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel label="언제 갈까요?" withReset />
            <div className="grid grid-cols-3 gap-2">
              {TIMINGS.map((t) => (
                <FilterCard
                  key={t.key}
                  title={t.label}
                  subTitle={t.subLabel}
                  isActive={timing === t.key}
                  onClick={() => toggleDraftTiming(t.key)}
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
