import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMapCluster } from './useMapPins'
import type { MapSpot } from '@/lib/utils/mapCluster'

vi.mock('@/components/Map/overlayHtml', () => ({
  createPinHTML: () => '<span>pin</span>',
  createClusterHTML: () => '<span>cluster</span>',
}))
vi.mock('@/lib/utils/mapCluster', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/utils/mapCluster')>()),
  createMapClusterQuery: (spots: MapSpot[]) =>
    function* () {
      for (const spot of spots) yield { lat: spot.lat, lng: spot.lng, spots: [spot] }
    },
  pinLabel: (spot: MapSpot) => spot.title,
  canSplitByZoom: () => false,
}))

let root: Root
let nextFrame: number
let frames: Map<number, FrameRequestCallback>
let events: Map<string, () => void>
let visible: Set<Overlay>
let map: kakao.maps.Map
let clock: number

class LatLng {
  constructor(
    private lat: number,
    private lng: number
  ) {}
  getLat() {
    return this.lat
  }
  getLng() {
    return this.lng
  }
}
class Overlay {
  constructor(public options: { content: HTMLElement }) {}
  setMap(value: unknown) {
    if (value) visible.add(this)
    else visible.delete(this)
  }
}

const spots = (prefix: string, count = 20): MapSpot[] =>
  Array.from({ length: count }, (_, i) => ({
    lat: 10 + i,
    lng: 20,
    title: `${prefix}${i}`,
    flowers: [],
    maxStage: 'Peak',
    statuses: ['PEAK'],
    categories: ['CHERRY'],
    type: 'ATTRACTION',
    spotId: i,
  }))
function Component({ data }: { data: MapSpot[] }) {
  useMapCluster(map, data)
  return null
}
function frame() {
  const callbacks = [...frames.values()]
  frames.clear()
  callbacks.forEach((callback) => callback(clock))
}
function drain() {
  let count = 0
  while (frames.size && count++ < 200) frame()
  expect(frames.size).toBe(0)
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  nextFrame = 0
  clock = 0
  frames = new Map()
  events = new Map()
  visible = new Set()
  vi.spyOn(performance, 'now').mockImplementation(() => clock++)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('kakao', {
    maps: {
      LatLng,
      CustomOverlay: Overlay,
      Point: class {
        constructor(
          public x: number,
          public y: number
        ) {}
      },
      event: {
        addListener: (_map: unknown, name: string, callback: () => void) =>
          events.set(name, callback),
        removeListener: (_map: unknown, name: string) => events.delete(name),
      },
    },
  })
  map = {
    getLevel: () => 8,
    getCenter: () => new LatLng(50, 50),
    getBounds: () => ({
      getSouthWest: () => new LatLng(0, 0),
      getNorthEast: () => new LatLng(100, 100),
    }),
    getProjection: () => ({
      containerPointFromCoords: (point: LatLng) => ({ x: point.getLng(), y: 100 - point.getLat() }),
      coordsFromContainerPoint: (point: { x: number; y: number }) =>
        new LatLng(100 - point.y, point.x),
    }),
  } as unknown as kakao.maps.Map
  root = createRoot(document.createElement('div'))
})
afterEach(async () => {
  await act(async () => root.unmount())
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('map frame scheduling', () => {
  it('줌 변경은 진행 중인 큐를 취소하고 디바운스 뒤 다시 예약한다', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await act(async () => root.render(h(Component, { data: spots('a') })))
    frame()
    events.get('zoom_changed')!()
    expect(frames.size).toBe(0)
    vi.advanceTimersByTime(119)
    expect(frames.size).toBe(0)
    vi.advanceTimersByTime(1)
    expect(frames.size).toBe(1)
    drain()
    expect(visible.size).toBe(20)
  })

  it('초기 표시와 idle 작업을 여러 프레임에 나누고 기존 오버레이를 재사용한다', async () => {
    await act(async () => root.render(h(Component, { data: spots('a') })))
    expect(visible.size).toBe(0)
    frame()
    expect(visible.size).toBeLessThan(20)
    expect(frames.size).toBe(1)
    drain()
    expect(visible.size).toBe(20)
    const original = [...visible]
    events.get('idle')!()
    expect(frames.size).toBe(0)
    drain()
    expect([...visible]).toEqual(original)
  })

  it('필터 변경은 이전 큐를 폐기하고 새 핀만 완성한다', async () => {
    await act(async () => root.render(h(Component, { data: spots('old') })))
    frame()
    await act(async () => root.render(h(Component, { data: spots('new', 3) })))
    drain()
    expect(
      [...visible].map((overlay) => overlay.options.content.getAttribute('aria-label'))
    ).toEqual(['new0', 'new1', 'new2'])
  })

  it('언마운트 후 남은 프레임과 지도 이벤트가 없다', async () => {
    await act(async () => root.render(h(Component, { data: spots('a') })))
    frame()
    await act(async () => root.unmount())
    expect(frames.size).toBe(0)
    expect(events.size).toBe(0)
    expect(visible.size).toBe(0)
  })
})
