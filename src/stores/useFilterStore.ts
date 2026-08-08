import { create } from 'zustand'
import type { BloomSlotCategory, BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

// 지도 상단 칩. 서버 파라미터가 없어 응답의 pin.type 으로 클라이언트에서 거른다.
export type PinTypeFilter = 'ALL' | 'ATTRACTION' | 'LOCAL'

interface FilterState {
  pinType: PinTypeFilter
  category: BloomSlotCategory | null
  statuses: BloomSlotStatus[]
  setPinType: (pinType: PinTypeFilter) => void
  setCategory: (category: BloomSlotCategory) => void
  toggleStatus: (status: BloomSlotStatus) => void
  reset: () => void
}

const INITIAL = {
  pinType: 'ALL' as PinTypeFilter,
  category: null,
  statuses: [] as BloomSlotStatus[],
}

/**
 * 지도·탐색 필터 상태.
 * 드로어를 닫아도 선택이 유지돼야 하므로 useDrawerStore(열림/닫힘 전담)와 분리한다.
 */
export const useFilterStore = create<FilterState>((set) => ({
  ...INITIAL,
  setPinType: (pinType) => set({ pinType }),
  // 서버 category 파라미터가 단일 값이라 단일 선택. 같은 값을 다시 누르면 해제한다.
  setCategory: (category) =>
    set((state) => ({ category: state.category === category ? null : category })),
  // 개화 상태는 서버 파라미터가 없어 클라이언트에서 거른다. 복수 선택.
  toggleStatus: (status) =>
    set((state) => ({
      statuses: state.statuses.includes(status)
        ? state.statuses.filter((value) => value !== status)
        : [...state.statuses, status],
    })),
  reset: () => set(INITIAL),
}))
