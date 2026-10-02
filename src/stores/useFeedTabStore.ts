import { create } from 'zustand'

// 피드 상단 탭('전체' | '관심 식물' | '팔로잉').
// FeedClient 의 useState 로 두면 기록 상세(/feed/[id])에 갔다 뒤로 올 때 피드가 새로 마운트되어
// 늘 '전체'로 돌아간다. 탐색의 꽃 필터(useFilterStore)처럼 화면 밖에 둬서 뒤로 가기에도 유지한다.
interface FeedTabState {
  tab: string
  setTab: (tab: string) => void
}

export const useFeedTabStore = create<FeedTabState>((set) => ({
  tab: '전체',
  setTab: (tab) => set({ tab }),
}))
