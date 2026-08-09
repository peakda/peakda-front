import { describe, it, expect, beforeEach } from 'vitest'
import { hasActiveFilter, useFilterStore } from './useFilterStore'

// 검색바 필터 아이콘에 빨간 점을 띄울지 판단한다.
describe('hasActiveFilter', () => {
  it('아무것도 안 골랐으면 false', () => {
    expect(hasActiveFilter({ region: null, timing: null, categories: [] })).toBe(false)
  })

  it('지역·시기·꽃 중 하나라도 있으면 true', () => {
    expect(hasActiveFilter({ region: 'JEJU', timing: null, categories: [] })).toBe(true)
    expect(hasActiveFilter({ region: null, timing: 'EARLY', categories: [] })).toBe(true)
    expect(hasActiveFilter({ region: null, timing: null, categories: ['CHERRY'] })).toBe(true)
  })

  it('꽃을 골랐다가 전부 해제하면 false', () => {
    expect(hasActiveFilter({ region: null, timing: null, categories: [] })).toBe(false)
  })
})

// 드로어에서 고른 값은 draft 일 뿐이고, 하단 버튼을 눌러야 applied 로 커밋된다.
// 지도를 눌러 그냥 닫으면 draft 는 버려진다.
describe('stores/useFilterStore', () => {
  beforeEach(() => useFilterStore.getState().reset())

  it('초기 상태 — 선택 없음', () => {
    const s = useFilterStore.getState()
    expect(s.pinType).toBe('ALL')
    expect(s.applied).toEqual({ region: null, timing: null, categories: [] })
    expect(s.draft).toEqual({ region: null, timing: null, categories: [] })
    expect(s.visibleSpotIds).toEqual([])
    expect(s.draftVisibleCount).toBe(0)
  })

  // 상단 칩은 드로어 밖이라 즉시 반영된다.
  it('setPinType — draft 를 거치지 않고 바로 적용된다', () => {
    useFilterStore.getState().setPinType('LOCAL')
    expect(useFilterStore.getState().pinType).toBe('LOCAL')
  })

  describe('draft 선택', () => {
    it('지역·시기는 단일 선택, 같은 값이면 해제', () => {
      const s = () => useFilterStore.getState()

      s().toggleDraftRegion('GANGWON')
      expect(s().draft.region).toBe('GANGWON')
      s().toggleDraftRegion('JEJU')
      expect(s().draft.region).toBe('JEJU')
      s().toggleDraftRegion('JEJU')
      expect(s().draft.region).toBeNull()

      s().toggleDraftTiming('STARTING')
      expect(s().draft.timing).toBe('STARTING')
      s().toggleDraftTiming('STARTING')
      expect(s().draft.timing).toBeNull()
    })

    // 서버 category 는 단일 값이지만 응답에 category 가 있어 클라에서 복수로 거른다.
    it('꽃 종류는 복수 선택', () => {
      const s = () => useFilterStore.getState()

      s().toggleDraftCategory('CHERRY')
      s().toggleDraftCategory('MAPLE')
      expect(s().draft.categories).toEqual(['CHERRY', 'MAPLE'])

      s().toggleDraftCategory('CHERRY')
      expect(s().draft.categories).toEqual(['MAPLE'])
    })

    it('draft 를 만져도 applied 는 그대로다', () => {
      const s = () => useFilterStore.getState()
      s().toggleDraftTiming('EARLY')
      s().toggleDraftCategory('CHERRY')

      expect(s().applied).toEqual({ region: null, timing: null, categories: [] })
    })
  })

  it('applyDraft — draft 를 applied 로 커밋한다', () => {
    const s = () => useFilterStore.getState()
    s().toggleDraftRegion('JEJU')
    s().toggleDraftTiming('EARLY')
    s().toggleDraftCategory('CHERRY')

    s().applyDraft()

    expect(s().applied).toEqual({ region: 'JEJU', timing: 'EARLY', categories: ['CHERRY'] })
  })

  it('applyDraft — 커밋 후 draft 를 또 만져도 applied 가 흔들리지 않는다', () => {
    const s = () => useFilterStore.getState()
    s().toggleDraftCategory('CHERRY')
    s().applyDraft()

    s().toggleDraftCategory('MAPLE')

    expect(s().applied.categories).toEqual(['CHERRY'])
    expect(s().draft.categories).toEqual(['CHERRY', 'MAPLE'])
  })

  // 드로어를 열 때마다 applied 기준으로 되돌려, 지난번에 버린 선택이 남지 않게 한다.
  it('syncDraft — applied 를 draft 로 되돌린다', () => {
    const s = () => useFilterStore.getState()
    s().toggleDraftCategory('CHERRY')
    s().applyDraft()
    s().toggleDraftCategory('MAPLE')
    s().toggleDraftTiming('EARLY')

    s().syncDraft()

    expect(s().draft).toEqual({ region: null, timing: null, categories: ['CHERRY'] })
  })

  // 필터를 끄려면 고른 걸 하나하나 다시 눌러야 했다. 초기화 버튼용.
  describe('resetDraft', () => {
    it('draft 선택을 전부 비운다', () => {
      const s = () => useFilterStore.getState()
      s().toggleDraftRegion('JEJU')
      s().toggleDraftTiming('EARLY')
      s().toggleDraftCategory('CHERRY')
      s().toggleDraftCategory('MAPLE')

      s().resetDraft()

      expect(s().draft).toEqual({ region: null, timing: null, categories: [] })
    })

    // 초기화도 draft 단계라, 하단 버튼을 눌러야 실제로 필터가 풀린다.
    it('applied 는 건드리지 않는다', () => {
      const s = () => useFilterStore.getState()
      s().toggleDraftCategory('CHERRY')
      s().applyDraft()

      s().resetDraft()

      expect(s().applied.categories).toEqual(['CHERRY'])
      expect(s().draft.categories).toEqual([])
    })

    it('초기화 후 applyDraft 하면 필터가 풀린다', () => {
      const s = () => useFilterStore.getState()
      s().toggleDraftCategory('CHERRY')
      s().applyDraft()

      s().resetDraft()
      s().applyDraft()

      expect(hasActiveFilter(s().applied)).toBe(false)
    })
  })

  it('setVisibleSpots — 지도가 발행한 결과를 담는다', () => {
    const s = () => useFilterStore.getState()
    s().setVisibleSpots({
      spotIds: [3, 1],
      center: { lat: 37.5, lng: 127 },
      isStale: true,
      draftCount: 5,
      appliedFor: s().applied,
    })

    expect(s().visibleSpotIds).toEqual([3, 1])
    expect(s().mapCenter).toEqual({ lat: 37.5, lng: 127 })
    expect(s().isVisibleStale).toBe(true)
    expect(s().draftVisibleCount).toBe(5)
  })

  // 지도(부모)보다 드로어(자식)의 effect 가 먼저 돌기 때문에, 커밋 직후 발행값은
  // 아직 옛 applied 기준이다. 드로어는 이걸 보고 목록 열기를 미뤄야 한다.
  describe('발행된 결과가 현재 applied 기준인지', () => {
    it('지도가 방금 발행했으면 현재 applied 와 같은 참조다', () => {
      const s = () => useFilterStore.getState()
      s().setVisibleSpots({
        spotIds: [1, 2, 3],
        center: null,
        isStale: false,
        draftCount: 3,
        appliedFor: s().applied,
      })

      expect(s().visibleAppliedFor).toBe(s().applied)
    })

    it('applyDraft 직후 재발행 전에는 참조가 어긋난다', () => {
      const s = () => useFilterStore.getState()
      s().setVisibleSpots({
        spotIds: [1, 2, 3],
        center: null,
        isStale: false,
        draftCount: 3,
        appliedFor: s().applied,
      })

      s().toggleDraftCategory('CHERRY')
      s().applyDraft()

      expect(s().visibleAppliedFor).not.toBe(s().applied)
    })

    // 아무것도 안 고치고 버튼만 눌렀으면 지금 발행값이 이미 정답이라 기다릴 이유가 없다.
    it('draft 를 안 건드리고 applyDraft 하면 참조가 유지된다', () => {
      const s = () => useFilterStore.getState()
      s().setVisibleSpots({
        spotIds: [1],
        center: null,
        isStale: false,
        draftCount: 1,
        appliedFor: s().applied,
      })

      s().syncDraft()
      s().applyDraft()

      expect(s().visibleAppliedFor).toBe(s().applied)
    })
  })

  it('reset — 전부 초기값으로 되돌린다', () => {
    const s = () => useFilterStore.getState()
    s().setPinType('ATTRACTION')
    s().toggleDraftCategory('CHERRY')
    s().applyDraft()
    s().setVisibleSpots({
      spotIds: [1],
      center: { lat: 1, lng: 2 },
      isStale: true,
      draftCount: 3,
      appliedFor: s().applied,
    })

    s().reset()

    const after = useFilterStore.getState()
    expect(after.pinType).toBe('ALL')
    expect(after.applied).toEqual({ region: null, timing: null, categories: [] })
    expect(after.draft).toEqual({ region: null, timing: null, categories: [] })
    expect(after.visibleSpotIds).toEqual([])
    expect(after.mapCenter).toBeNull()
    expect(after.isVisibleStale).toBe(false)
    expect(after.draftVisibleCount).toBe(0)
    expect(after.visibleAppliedFor).toBe(after.applied)
  })
})
