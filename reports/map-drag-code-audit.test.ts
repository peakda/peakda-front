// Code-path audit, not an FPS benchmark. The hook, clustering, HTML builders and
// installed Supercluster are real. Only the map SDK, projection and clock are fake.
import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Supercluster from 'supercluster'
import { useMapCluster } from '@/hooks/useMapPins'
import * as clustering from '@/lib/utils/mapCluster'
import * as html from '@/components/Map/overlayHtml'
import type { MapSpot } from '@/lib/utils/mapCluster'

const WIDTH = 390
const HEIGHT = 844
const PX_PER_DEGREE = 10_000
const actualClusterSpots = clustering.clusterSpots
const actualQuery = clustering.createMapClusterQuery
const spot = (lat: number, lng: number): MapSpot => ({
  lat,
  lng,
  flowers: [{ src: '/flowers/cherry-blossom.webp', alt: '벚꽃' }],
  maxStage: 'Peak',
  type: 'ATTRACTION',
  statuses: ['PEAK'],
  categories: ['CHERRY'],
})
const fixture = () =>
  Array.from({ length: 100 }, (_, i) => {
    const lat = 37.5 - Math.floor(i / 10) * 0.1
    const lng = 127 + (i % 10) * 0.1
    return [spot(lat, lng), spot(lat + 0.0001, lng + 0.0001)]
  }).flat()

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
let root: Root
let map: kakao.maps.Map
let center: { lat: number; lng: number }
let level: number
let clock: number
let clockStep: number
let nextFrame: number
let frames: Map<number, FrameRequestCallback>
let events: Map<string, () => void>
let visible: Set<Overlay>
let visits: number
let attachments: number
let detachments: number
let onPinClick = vi.fn<(spot: MapSpot) => void>()
let onClusterClick = vi.fn<(spots: MapSpot[]) => void>()
class Overlay {
  constructor(public options: { content: HTMLElement; position: LatLng }) {}
  setMap(target: unknown) {
    if (target) {
      attachments++
      visible.add(this)
    } else {
      detachments++
      visible.delete(this)
    }
  }
}
function Component({ data }: { data: MapSpot[] }) {
  useMapCluster(map, data, onPinClick, onClusterClick)
  return null
}
function frame() {
  const callbacks = [...frames.values()]
  frames.clear()
  callbacks.forEach((callback) => callback(clock))
}
function drain() {
  let count = 0
  while (frames.size && count++ < 1000) frame()
  expect(frames.size).toBe(0)
}
function metrics() {
  return {
    queryFactories: vi.mocked(clustering.createMapClusterQuery).mock.calls.length,
    indexBuilds: vi.mocked(Supercluster.prototype.load).mock.calls.length,
    clusterQueries: vi.mocked(Supercluster.prototype.getClusters).mock.calls.length,
    leafQueries: vi.mocked(Supercluster.prototype.getLeaves).mock.calls.length,
    groupVisits: visits,
    clusterHTML: vi.mocked(html.createClusterHTML).mock.calls.length,
    pinHTML: vi.mocked(html.createPinHTML).mock.calls.length,
    attachments,
    detachments,
  }
}
function resetMetrics() {
  vi.clearAllMocks()
  visits = attachments = detachments = 0
}
async function mount(data = fixture()) {
  await act(async () => root.render(h(Component, { data })))
  drain()
  return data
}

beforeEach(() => {
  center = { lat: 37.5, lng: 127 }
  level = 8
  clock = 0
  clockStep = 0.001 // deterministic scheduling only; these are NOT measured times
  nextFrame = visits = attachments = detachments = 0
  frames = new Map()
  events = new Map()
  visible = new Set()
  onPinClick = vi.fn()
  onClusterClick = vi.fn()
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += clockStep))
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('kakao', {
    maps: {
      LatLng,
      CustomOverlay: Overlay,
      LatLngBounds: class {
        points: LatLng[] = []
        extend(point: LatLng) {
          this.points.push(point)
        }
      },
      Point: class {
        constructor(
          public x: number,
          public y: number
        ) {}
      },
      event: {
        addListener: (_: unknown, name: string, callback: () => void) => events.set(name, callback),
        removeListener: (_: unknown, name: string) => events.delete(name),
      },
    },
  })
  map = {
    getLevel: () => level,
    setBounds: vi.fn(),
    setLevel: vi.fn((next: number) => {
      level = next
    }),
    getCenter: () => new LatLng(center.lat, center.lng),
    getBounds: () => ({
      getSouthWest: () =>
        new LatLng(center.lat - HEIGHT / 2 / PX_PER_DEGREE, center.lng - WIDTH / 2 / PX_PER_DEGREE),
      getNorthEast: () =>
        new LatLng(center.lat + HEIGHT / 2 / PX_PER_DEGREE, center.lng + WIDTH / 2 / PX_PER_DEGREE),
    }),
    getProjection: () => ({
      containerPointFromCoords: (point: LatLng) => ({
        x: WIDTH / 2 + (point.getLng() - center.lng) * PX_PER_DEGREE,
        y: HEIGHT / 2 - (point.getLat() - center.lat) * PX_PER_DEGREE,
      }),
      coordsFromContainerPoint: (point: { x: number; y: number }) =>
        new LatLng(
          center.lat - (point.y - HEIGHT / 2) / PX_PER_DEGREE,
          center.lng + (point.x - WIDTH / 2) / PX_PER_DEGREE
        ),
    }),
  } as unknown as kakao.maps.Map
  vi.spyOn(Supercluster.prototype, 'load')
  vi.spyOn(Supercluster.prototype, 'getClusters')
  vi.spyOn(Supercluster.prototype, 'getLeaves')
  vi.spyOn(html, 'createClusterHTML')
  vi.spyOn(html, 'createPinHTML')
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  vi.spyOn(clustering, 'createMapClusterQuery').mockImplementation((data) => {
    const query = actualQuery(data)
    return function* (...args) {
      for (const group of query(...args)) {
        visits++
        yield group
      }
    }
  })
  root = createRoot(document.createElement('div'))
})
afterEach(async () => {
  await act(async () => root.unmount())
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function move(lng: number) {
  center.lng = lng
  events.get('bounds_changed')!()
}
// 실제 SDK는 드래그를 놓을 때 idle 을 dragend 보다 먼저 보낸다(2026-10 브라우저 실측).
// 훅이 dragstart/dragend 를 듣지 않아도 같은 순서로 보낸다(듣는 구현의 회귀를 잡기 위해).
function grab() {
  events.get('dragstart')?.()
}
function release() {
  events.get('idle')!()
  events.get('dragend')?.()
}

describe('optimized map hook: real clustering and HTML', () => {
  it('only expands the visible cluster, not the other 99', async () => {
    await mount()
    expect(metrics()).toMatchObject({
      indexBuilds: 1,
      clusterQueries: 1,
      leafQueries: 1,
      groupVisits: 1,
      clusterHTML: 1,
      attachments: 1,
      detachments: 0,
    })
    expect(vi.mocked(Supercluster.prototype.getClusters).mock.calls[0][0]).not.toEqual([
      -180, -85, 180, 85,
    ])
  })

  it('60 short moving frames do not scan groups, rebuild HTML or change overlays', async () => {
    await mount()
    const original = [...visible]
    resetMetrics()
    grab()
    for (let i = 0; i < 60; i++) {
      move(center.lng + 0.000001)
      frame()
    }
    expect(metrics()).toMatchObject({
      indexBuilds: 0,
      clusterQueries: 0,
      leafQueries: 0,
      groupVisits: 0,
      clusterHTML: 0,
      attachments: 0,
      detachments: 0,
    })
    expect([...visible]).toEqual(original)
    expect(frames.size).toBe(0)
    release()
    drain()
    expect(visits).toBe(1)
    expect(metrics().clusterQueries).toBe(0) // wider coordinate cache reused
    expect([...visible]).toEqual(original)
  })

  it('a stationary drag does not keep an rAF loop or refresh overlays', async () => {
    await mount()
    resetMetrics()
    grab()
    move(center.lng)
    drain()
    expect(visits).toBe(0)
    expect(frames.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('leaving the prepared area refills at once, coalescing move events while it runs', async () => {
    await mount()
    resetMetrics()
    for (let i = 0; i < 30; i++) move(127.1)
    // 타이머를 기다리지 않고 첫 이벤트에서 바로 보충을 예약한다.
    expect(frames.size).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
    drain()
    expect(metrics()).toMatchObject({
      indexBuilds: 0,
      clusterQueries: 1,
      leafQueries: 1,
      groupVisits: 1,
      attachments: 1,
      detachments: 1,
    })
    expect(visible.size).toBe(1)
    // A completed refill at the final bounds must not be repeated by idle.
    release()
    drain()
    expect(visits).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('attaches pins before their body reaches the screen during a steady drag', async () => {
    await mount()
    // 10px 씩 오른쪽으로 끌어 다음 군집(1,000px 옆)을 화면으로 들여온다. 핀 몸통은 좌표에서
    // 좌우 약 32px 이므로, 좌표가 화면 오른쪽 + 32px 안에 들어오면 이미 붙어 있어야 한다.
    const target = { lat: 37.5, lng: 127.1 }
    const isAttached = () =>
      [...visible].some(
        (o) =>
          Math.abs(o.options.position.getLat() - target.lat) < 0.001 &&
          Math.abs(o.options.position.getLng() - target.lng) < 0.001
      )
    let checked = 0
    grab()
    while (center.lng < 127.1) {
      move(center.lng + 10 / PX_PER_DEGREE)
      frame()
      const screenX = WIDTH / 2 + (target.lng - center.lng) * PX_PER_DEGREE
      if (screenX < WIDTH + 32) {
        checked++
        expect(isAttached()).toBe(true)
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('programmatic movement and inertia refill and settle without drag events', async () => {
    await mount()
    resetMetrics()
    move(127.1)
    drain()
    move(127.2)
    drain()
    events.get('idle')!()
    drain()
    expect(attachments).toBe(2)
    expect(detachments).toBe(2)
    expect(visible.size).toBe(1)
  })

  it('a filter change right after a drag release redraws at once, not after a delay', async () => {
    const data = await mount()
    grab()
    move(center.lng + 0.000001)
    release()
    drain()
    resetMetrics()
    const updated = data.map((s) => ({ ...s, maxStage: 'End' as const }))
    await act(async () => root.render(h(Component, { data: updated })))
    // 드래그 뒤에 '이동 중' 상태가 남아 타이머를 기다리면 안 된다.
    expect(frames.size).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
    drain()
    expect(metrics().indexBuilds).toBe(1)
    expect(attachments).toBe(1)
    expect(detachments).toBe(1)
    expect([...visible][0].options.content.innerHTML).toContain('#c41f33')
  })

  it('new zoom cancels pending movement work; revisiting reuses group HTML', async () => {
    await mount()
    move(127.1)
    events.get('zoom_start')!()
    level = 9
    events.get('zoom_changed')!()
    vi.advanceTimersByTime(119)
    expect(frames.size).toBe(0)
    events.get('idle')!()
    drain()
    expect(visible.size).toBe(1)
    resetMetrics()
    center.lng = 127
    level = 8
    events.get('zoom_changed')!()
    vi.advanceTimersByTime(120)
    drain()
    expect(metrics().indexBuilds).toBe(0)
    expect(metrics().leafQueries).toBe(0)
    expect(metrics().clusterHTML).toBe(0)
  })

  it('interrupting an unfinished initial render eventually fills the latest viewport', async () => {
    const data = fixture()
    clockStep = 1
    await act(async () => root.render(h(Component, { data })))
    frame()
    move(127.1)
    // 진행 중인 초기 작업은 끊지 않고 끝낸 뒤, 바뀐 화면을 이어서 보충한다(idle 없이도).
    expect(frames.size).toBe(1)
    drain()
    expect(visible.size).toBe(1)
    expect([...visible][0].options.content.getAttribute('aria-label')).toBe('명소 2곳 묶음')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('unmount clears scheduled checks, frame work, overlays and listeners', async () => {
    await mount()
    move(127.1)
    expect(frames.size).toBe(1)
    events.get('zoom_changed')!()
    expect(vi.getTimerCount()).toBe(1)
    await act(async () => root.unmount())
    expect(vi.getTimerCount()).toBe(0)
    expect(frames.size).toBe(0)
    expect(visible.size).toBe(0)
    expect(events.size).toBe(0)
  })

  it('empty filtered data clears old pins and does not leave a polling loop', async () => {
    await mount()
    await act(async () => root.render(h(Component, { data: [] })))
    drain()
    expect(visible.size).toBe(0)
    move(127.1)
    drain()
    expect(frames.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('a second zoom start cancels the previous debounce until its own zoom settles', async () => {
    await mount()
    events.get('zoom_changed')!()
    vi.advanceTimersByTime(100)
    events.get('zoom_start')!()
    vi.advanceTimersByTime(30)
    expect(frames.size).toBe(0)
    level = 9
    events.get('zoom_changed')!()
    vi.advanceTimersByTime(120)
    drain()
    expect(visible.size).toBe(1)
  })

  it('continuous motion does not restart or starve an in-progress refill', async () => {
    await mount()
    resetMetrics()
    clockStep = 0.5
    grab()
    move(127.1)
    for (let i = 0; i < 30; i++) {
      move(127.1 + i * 0.000001)
      frame()
    }
    expect(visits).toBe(1)
    expect(attachments).toBe(1)
    expect(detachments).toBe(1)
    release()
    drain()
    expect(visible.size).toBe(1)
  })

  it('reused cluster overlays activate the latest members by keyboard', async () => {
    const data = [spot(37.5, 127), spot(37.5, 127)]
    await mount(data)
    const original = [...visible][0]
    const updated = data.map((s) => ({ ...s, title: 'latest' }))
    await act(async () => root.render(h(Component, { data: updated })))
    drain()
    expect([...visible][0]).toBe(original)
    original.options.content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(onClusterClick).toHaveBeenCalledOnce()
    expect(onClusterClick.mock.calls[0][0].every((s: MapSpot) => s.title === 'latest')).toBe(true)
  })

  it('split cluster clicks retain bounds fitting and the one-level zoom fallback', async () => {
    const data = [spot(37.5, 127), spot(37.505, 127.005)]
    await mount(data)
    expect(visible.size).toBe(1)
    ;[...visible][0].options.content.click()
    expect(map.setBounds).toHaveBeenCalledOnce()
    expect(map.setLevel).toHaveBeenCalledWith(7, expect.any(Object))
    expect(onClusterClick).not.toHaveBeenCalled()
  })

  it('individual pin clicks return the current spot object', async () => {
    level = 3
    const data = [spot(37.5, 127)]
    await mount(data)
    ;[...visible][0].options.content.click()
    expect(onPinClick).toHaveBeenCalledWith(data[0])
  })
})

describe('viewport query correctness and bounded reuse', () => {
  it('preserves full cluster membership even when a member is outside the bbox', () => {
    const data = fixture()
    const query = actualQuery(data)
    const bbox: clustering.MapBounds = [126.99999, 37.49999, 127.00008, 37.50008]
    const [group] = [...query(bbox, 8)]
    expect(group.spots).toHaveLength(2)
    expect(group.spots.some((s) => s.lng > bbox[2])).toBe(true)
    const original = actualClusterSpots(data, 8).find(
      (c) => c.lat === group.lat && c.lng === group.lng
    )
    expect(group).toEqual(original)
    expect([...query(bbox, 8)][0]).toBe(group)
  })

  it.each([1, 2, 3])(
    'level %i includes individual pins whose cluster center lies outside',
    async (zoomLevel) => {
      level = zoomLevel
      const data = [spot(37.5, 127), spot(37.5, 127.00012)]
      await mount(data)
      expect(visible.size).toBe(2)
      expect(metrics().pinHTML).toBe(2)
      const bbox: clustering.MapBounds = [126.9999, 37.4999, 127.00002, 37.5001]
      const query = actualQuery(data)
      expect([...query(bbox, zoomLevel)].map((c) => c.spots[0])).toEqual([data[0]])
    }
  )

  it('matches the previous renderer across all levels and several regions', () => {
    const data = fixture()
    const query = actualQuery(data)
    const boxes: clustering.MapBounds[] = [
      [126.99, 37.49, 127.11, 37.51],
      [126.9, 36.5, 128, 37.6],
      [128.5, 35, 129, 36],
    ]
    const identity = (s: MapSpot) => data.indexOf(s)
    for (let zoomLevel = 1; zoomLevel <= 13; zoomLevel++) {
      const all = actualClusterSpots(data, zoomLevel)
      for (const box of boxes) {
        const expected = all.flatMap((c) =>
          zoomLevel >= 4 && c.spots.length >= 2
            ? clustering.isInsideMapBounds(box, c.lat, c.lng)
              ? [c]
              : []
            : c.spots
                .filter((s) => clustering.isInsideMapBounds(box, s.lat, s.lng))
                .map((s) => ({ lat: s.lat, lng: s.lng, spots: [s] }))
        )
        const normalize = (list: clustering.ClusterGroup[]) =>
          list
            .map((c) => ({
              lat: Number(c.lat.toFixed(8)),
              lng: Number(c.lng.toFixed(8)),
              members: c.spots.map(identity).sort((a, b) => a - b),
            }))
            .sort((a, b) => a.members[0] - b.members[0])
        expect(normalize([...query(box, zoomLevel)])).toEqual(normalize(expected))
      }
    }
  })

  it('evicts old groups instead of retaining every visited point forever', () => {
    const data = Array.from({ length: 300 }, (_, i) => spot(37, 125 + i * 0.01))
    const query = actualQuery(data)
    const box = (lng: number): clustering.MapBounds => [lng - 0.001, 36.999, lng + 0.001, 37.001]
    const first = [...query(box(data[0].lng), 1)][0]
    for (const item of data.slice(1)) Array.from(query(box(item.lng), 1))
    const again = [...query(box(data[0].lng), 1)][0]
    expect(again).toEqual(first)
    expect(again).not.toBe(first)
  })

  it('new data gets new members even when the library reuses a numeric cluster id', () => {
    const a = [spot(37.5, 127), spot(37.5001, 127.0001)]
    const b = a.map((s) => ({ ...s, title: 'updated' }))
    const box: clustering.MapBounds = [126, 37, 128, 38]
    const oldGroup = [...actualQuery(a)(box, 8)][0]
    const newGroup = [...actualQuery(b)(box, 8)][0]
    expect(newGroup).not.toBe(oldGroup)
    expect(newGroup.spots.every((s) => s.title === 'updated')).toBe(true)
  })
})
