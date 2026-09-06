import { describe, it, expect } from 'vitest'
import { clusterSlices, clusterSpots } from './useMapPins'
import type { MapSpot } from './useMapPins'
import type { Stage } from '@/constants/map'

// 모바일 기준 뷰포트 (서비스 주 타깃)
const VIEWPORT_W = 390
const VIEWPORT_H = 844

// 카카오맵 해상도: level 3 = 1m/px, 레벨당 2배
const metersPerPixel = (level: number) => Math.pow(2, level - 3)

// 위도 37.5(수도권) 기준 1도당 거리
const M_PER_DEG_LAT = 111_000
const M_PER_DEG_LNG = 88_300

const spot = (lat: number, lng: number): MapSpot => ({
  lat,
  lng,
  flowers: [{ src: '/flowers/cherry-blossom.webp', alt: '벚꽃' }],
  maxStage: 'Peak',
  type: 'ATTRACTION',
  statuses: ['PEAK'],
  categories: ['CHERRY'],
})

/** 클러스터 구성원들이 차지하는 지리적 범위를 화면 px 로 환산 */
const spanInPixels = (spots: MapSpot[], level: number) => {
  const lats = spots.map((s) => s.lat)
  const lngs = spots.map((s) => s.lng)
  const mpp = metersPerPixel(level)
  return {
    w: ((Math.max(...lngs) - Math.min(...lngs)) * M_PER_DEG_LNG) / mpp,
    h: ((Math.max(...lats) - Math.min(...lats)) * M_PER_DEG_LAT) / mpp,
  }
}

/**
 * 해당 레벨에서 화면상 `stepPx` 간격이 되는 스팟 격자.
 * 셀 크기를 상수로 가정하지 않고, 화면 기준으로 촘촘히 깔아 셀이 채워지게 한다.
 */
// n 은 격자가 화면 폭의 2배 이상을 덮도록 잡는다. 좁게 잡으면 셀이 화면보다
// 넓어도 격자가 셀 안에 다 들어가버려 불변식 위반을 놓친다.
const denseGrid = (level: number, n = 48, stepPx = VIEWPORT_W / 20) => {
  const m = stepPx * metersPerPixel(level)
  const stepLat = m / M_PER_DEG_LAT
  const stepLng = m / M_PER_DEG_LNG
  const spots: MapSpot[] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      spots.push(spot(37.4 + i * stepLat, 126.8 + j * stepLng))
    }
  }
  return spots
}

const LEVELS = [2, 4, 6, 8, 10, 12]

const stageSpot = (maxStage: Stage): MapSpot => ({ ...spot(37.5, 127.0), maxStage })
const slices = (stages: Stage[]) => clusterSlices(stages.map(stageSpot))

describe('clusterSlices', () => {
  it('스팟이 많은 상태부터 정렬한다', () => {
    expect(slices(['Start', 'Peak', 'Peak', 'Start', 'Peak'])).toEqual([
      { stage: 'Peak', count: 3 },
      { stage: 'Start', count: 2 },
    ])
  })

  it('개수가 같으면 만개 > 피기시작 > 늦었다 > 개화전 순으로 둔다', () => {
    expect(slices(['Before', 'End', 'Start', 'Peak'])).toEqual([
      { stage: 'Peak', count: 1 },
      { stage: 'Start', count: 1 },
      { stage: 'End', count: 1 },
      { stage: 'Before', count: 1 },
    ])
  })

  it('5-3-3-1 이면 동률인 피기시작(3)이 개화전(3)보다 앞에 온다', () => {
    const stages: Stage[] = [
      ...Array<Stage>(5).fill('Peak'),
      ...Array<Stage>(3).fill('Start'),
      ...Array<Stage>(3).fill('Before'),
      'End',
    ]

    expect(slices(stages).map((s) => s.stage)).toEqual(['Peak', 'Start', 'Before', 'End'])
  })
})

describe('clusterSpots', () => {
  describe('기본 그룹핑', () => {
    it('같은 셀 안의 스팟은 하나로 묶인다', () => {
      const clusters = clusterSpots([spot(37.5, 127.0), spot(37.5001, 127.0001)], 8)
      expect(clusters).toHaveLength(1)
      expect(clusters[0].spots).toHaveLength(2)
    })

    it('멀리 떨어진 스팟은 분리된다', () => {
      const clusters = clusterSpots([spot(37.5, 127.0), spot(35.1, 129.0)], 8)
      expect(clusters).toHaveLength(2)
    })

    it('클러스터 좌표는 구성원의 평균이다', () => {
      const [c] = clusterSpots([spot(37.5, 127.0), spot(37.5002, 127.0002)], 8)
      expect(c.lat).toBeCloseTo(37.5001, 6)
      expect(c.lng).toBeCloseTo(127.0001, 6)
    })
  })

  // 이 버그의 핵심. 셀이 화면보다 넓으면 (1) 구성원이 화면 밖으로 흩어지고
  // (2) 확대해도 셀이 같은 비율로 커져 클러스터가 영원히 안 쪼개진다.
  describe('셀 크기 불변식', () => {
    it.each(LEVELS)('level %i: 클러스터 구성원이 화면 안에 들어온다', (level) => {
      // 셀보다 촘촘한 격자를 깔아 셀을 가득 채운다
      const clusters = clusterSpots(denseGrid(level), level)
      const multi = clusters.filter((c) => c.spots.length >= 2)
      expect(multi.length).toBeGreaterThan(0)

      for (const c of multi) {
        const { w, h } = spanInPixels(c.spots, level)
        expect(w).toBeLessThanOrEqual(VIEWPORT_W)
        expect(h).toBeLessThanOrEqual(VIEWPORT_H)
      }
    })

    // 셀이 화면 px 기준으로 일정해야 확대할수록 클러스터가 쪼개진다.
    // 도(°) 단위로 고정하면 셀이 줌과 같은 비율로 커져 영원히 안 쪼개졌다.
    it('셀의 화면상 크기는 모든 레벨에서 동일하다', () => {
      const PROBE_STEP_PX = VIEWPORT_W / 20
      const widths = LEVELS.map((level) => {
        const clusters = clusterSpots(denseGrid(level), level)
        const multi = clusters.filter((c) => c.spots.length >= 2)
        return Math.max(...multi.map((c) => spanInPixels(c.spots, level).w))
      })
      // 프로브 격자 위상에 따라 한 스텝만큼 흔들릴 수 있다(px 단위로 반올림해 비교)
      for (const w of widths) {
        expect(Math.round(Math.abs(w - widths[0]))).toBeLessThanOrEqual(Math.ceil(PROBE_STEP_PX))
      }
    })
  })

  describe('드릴다운', () => {
    // 클러스터 클릭 시 map.setBounds(구성원 전체) 동작 근사.
    // 구성원이 (패딩 제외) 화면에 들어오는 가장 낮은 레벨을 고른다.
    const PAD = { x: 80, y: 320 } // 헤더·카테고리·검색바 / Nav
    const levelFittingBounds = (spots: MapSpot[]) => {
      const lats = spots.map((s) => s.lat)
      const lngs = spots.map((s) => s.lng)
      const wM = (Math.max(...lngs) - Math.min(...lngs)) * M_PER_DEG_LNG
      const hM = (Math.max(...lats) - Math.min(...lats)) * M_PER_DEG_LAT
      for (let l = 1; l <= 14; l++) {
        const mpp = metersPerPixel(l)
        if (wM <= (VIEWPORT_W - PAD.x) * mpp && hM <= (VIEWPORT_H - PAD.y) * mpp) return l
      }
      return 14
    }

    it('클러스터를 클릭하면 항상 확대된다(축소·제자리걸음 없음)', () => {
      const level = 10
      const clusters = clusterSpots(denseGrid(level), level)
      const multi = clusters.filter((c) => c.spots.length >= 2)
      expect(multi.length).toBeGreaterThan(0)

      for (const c of multi) {
        expect(levelFittingBounds(c.spots)).toBeLessThan(level)
      }
    })

    it('반복해서 누르면 개별 핀까지 분해된다', () => {
      let level = 12
      let pool = denseGrid(level, 14)
      const trail: number[] = [level]

      for (let hop = 0; hop < 10; hop++) {
        const clusters = clusterSpots(pool, level)
        const multi = clusters.filter((c) => c.spots.length >= 2 && level >= 4)
        if (multi.length === 0) {
          expect(trail.length).toBeGreaterThan(1) // 최소 한 번은 파고들었다
          return
        }
        const target = multi.reduce((a, b) => (b.spots.length > a.spots.length ? b : a))
        const next = levelFittingBounds(target.spots)
        expect(next).toBeLessThan(level)
        level = next
        pool = target.spots
        trail.push(level)
      }
      throw new Error(`10회 안에 개별 핀까지 분해되지 않음: ${trail.join(' → ')}`)
    })
  })
})
