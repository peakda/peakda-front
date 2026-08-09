import { create } from 'zustand'
import type { BloomSlotCategory } from '@/api/facades/generated/peakdaApi.schemas'
import type { RegionKey } from '@/constants/region'
import type { TimingKey } from '@/lib/utils/timing'

// 지도 상단 칩. 서버 파라미터가 없어 응답의 pin.type 으로 클라이언트에서 거른다.
export type PinTypeFilter = 'ALL' | 'ATTRACTION' | 'LOCAL'

export interface MapCoords {
  lat: number
  lng: number
}

export interface FilterValues {
  /** 아직 서버 파라미터가 없어 조회에 반영되지 않는다. 생기면 date 와 같은 자리에 붙인다. */
  region: RegionKey | null
  /** 방문예정일 → 서버 date 파라미터 */
  timing: TimingKey | null
  /** 서버 category 는 값 하나만 받으므로 복수 선택은 클라이언트에서 거른다 */
  categories: BloomSlotCategory[]
}

interface VisibleSpots {
  spotIds: number[]
  center: MapCoords | null
  /** 지도 데이터가 아직 이전 조건의 결과인지 (React Query placeholderData) */
  isStale: boolean
  /** draft 기준으로 세어 둔 개수 — 꽃 종류 탭 버튼의 'N개' */
  draftCount: number
  /** 이 결과가 어떤 applied 기준으로 계산됐는지 — 드로어가 최신 여부를 참조 비교로 판단한다 */
  appliedFor: FilterValues
}

interface FilterState {
  /** 상단 칩은 드로어 밖이라 draft 를 거치지 않고 즉시 반영된다 */
  pinType: PinTypeFilter
  /** 지도·조회에 실제로 반영된 값 */
  applied: FilterValues
  /** 드로어에서 고르는 중인 값. 버튼을 눌러야 applied 가 된다 */
  draft: FilterValues

  visibleSpotIds: number[]
  mapCenter: MapCoords | null
  isVisibleStale: boolean
  draftVisibleCount: number
  /**
   * visibleSpotIds 를 계산할 때 쓰인 applied.
   *
   * 드로어는 지도의 자식이라 effect 가 먼저 돈다. 버튼을 눌러 applied 가 바뀐 직후
   * 발행값은 아직 옛 조건 기준이므로, 이 값이 applied 와 같은 참조가 될 때까지 기다려야
   * 직전 필터 결과로 목록을 여는 일이 없다.
   */
  visibleAppliedFor: FilterValues

  setPinType: (pinType: PinTypeFilter) => void
  toggleDraftRegion: (region: RegionKey) => void
  toggleDraftTiming: (timing: TimingKey) => void
  toggleDraftCategory: (category: BloomSlotCategory) => void
  /** 드로어를 열 때 applied 기준으로 되돌린다 — 지난번에 버린 선택이 남지 않게 */
  syncDraft: () => void
  applyDraft: () => void
  setVisibleSpots: (visible: VisibleSpots) => void
  reset: () => void
}

const EMPTY_VALUES: FilterValues = { region: null, timing: null, categories: [] }

/** 필터가 하나라도 걸려 있는지 — 검색바 필터 아이콘의 빨간 점 표시에 쓴다 */
export function hasActiveFilter(values: FilterValues): boolean {
  return values.region != null || values.timing != null || values.categories.length > 0
}

const INITIAL = {
  pinType: 'ALL' as PinTypeFilter,
  applied: EMPTY_VALUES,
  draft: EMPTY_VALUES,
  visibleSpotIds: [] as number[],
  mapCenter: null,
  isVisibleStale: false,
  draftVisibleCount: 0,
  visibleAppliedFor: EMPTY_VALUES,
}

// 같은 값을 다시 누르면 해제되는 단일 선택
const toggleSingle = <T>(current: T | null, next: T) => (current === next ? null : next)

/**
 * 지도 필터 상태.
 *
 * 드로어에서 고른 값은 draft 일 뿐이고, 하단 버튼을 눌러야 applied 로 커밋된다.
 * 그래서 필터를 만지는 것만으로는 `GET /api/seasonal/blooms` 가 다시 나가지 않고,
 * 지도를 눌러 드로어를 닫으면 고른 값이 그대로 버려진다.
 */
export const useFilterStore = create<FilterState>((set) => ({
  ...INITIAL,

  setPinType: (pinType) => set({ pinType }),

  toggleDraftRegion: (region) =>
    set((s) => ({ draft: { ...s.draft, region: toggleSingle(s.draft.region, region) } })),

  // 시기는 date 파라미터 하나로 나가므로 복수 선택이 성립하지 않는다.
  toggleDraftTiming: (timing) =>
    set((s) => ({ draft: { ...s.draft, timing: toggleSingle(s.draft.timing, timing) } })),

  toggleDraftCategory: (category) =>
    set((s) => ({
      draft: {
        ...s.draft,
        categories: s.draft.categories.includes(category)
          ? s.draft.categories.filter((c) => c !== category)
          : [...s.draft.categories, category],
      },
    })),

  syncDraft: () => set((s) => ({ draft: s.applied })),
  applyDraft: () => set((s) => ({ applied: s.draft })),

  setVisibleSpots: ({ spotIds, center, isStale, draftCount, appliedFor }) =>
    set({
      visibleSpotIds: spotIds,
      mapCenter: center,
      isVisibleStale: isStale,
      draftVisibleCount: draftCount,
      visibleAppliedFor: appliedFor,
    }),

  reset: () => set(INITIAL),
}))
