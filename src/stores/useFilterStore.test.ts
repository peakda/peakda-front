import { describe, it, expect, beforeEach } from 'vitest'
import { useFilterStore } from './useFilterStore'

// 드로어가 닫혀도 선택이 살아 있어야 하므로 필터는 드로어 스토어와 분리해 둔다.
describe('stores/useFilterStore', () => {
  beforeEach(() => useFilterStore.getState().reset())

  it('초기 상태 — 전체 핀, 카테고리 없음, 상태 필터 없음', () => {
    const s = useFilterStore.getState()
    expect(s.pinType).toBe('ALL')
    expect(s.category).toBeNull()
    expect(s.statuses).toEqual([])
  })

  // 서버 category 파라미터가 단일 값이라 UI 도 단일 선택으로 맞춘다.
  it('setCategory — 다른 값을 넣으면 교체된다', () => {
    useFilterStore.getState().setCategory('CHERRY')
    expect(useFilterStore.getState().category).toBe('CHERRY')

    useFilterStore.getState().setCategory('MAPLE')
    expect(useFilterStore.getState().category).toBe('MAPLE')
  })

  it('setCategory — 같은 값을 다시 넣으면 해제된다', () => {
    useFilterStore.getState().setCategory('CHERRY')
    useFilterStore.getState().setCategory('CHERRY')
    expect(useFilterStore.getState().category).toBeNull()
  })

  // 개화 상태는 서버 파라미터가 없어 클라이언트에서 거른다. 복수 선택.
  it('toggleStatus — 복수 선택으로 누적되고 다시 누르면 빠진다', () => {
    useFilterStore.getState().toggleStatus('PEAK')
    useFilterStore.getState().toggleStatus('STARTED')
    expect(useFilterStore.getState().statuses).toEqual(['PEAK', 'STARTED'])

    useFilterStore.getState().toggleStatus('PEAK')
    expect(useFilterStore.getState().statuses).toEqual(['STARTED'])
  })

  it('setPinType — 지도 상단 칩', () => {
    useFilterStore.getState().setPinType('LOCAL')
    expect(useFilterStore.getState().pinType).toBe('LOCAL')
  })

  it('reset — 전부 초기값으로 되돌린다', () => {
    const s = useFilterStore.getState()
    s.setCategory('CHERRY')
    s.toggleStatus('PEAK')
    s.setPinType('ATTRACTION')

    useFilterStore.getState().reset()

    const after = useFilterStore.getState()
    expect(after.category).toBeNull()
    expect(after.statuses).toEqual([])
    expect(after.pinType).toBe('ALL')
  })
})
