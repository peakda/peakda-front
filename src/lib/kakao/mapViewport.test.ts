import { describe, it, expect } from 'vitest'
import { sameBbox, snapBbox } from '@/lib/kakao/mapViewport'

const view = { minLat: 37.51234, minLng: 126.91234, maxLat: 37.60123, maxLng: 127.04321 }

describe('snapBbox', () => {
  it('격자에 스냅해도 화면을 항상 덮는다 (min 내림·max 올림)', () => {
    const box = snapBbox(view, 8, undefined)
    expect(box.minLat).toBeLessThanOrEqual(view.minLat)
    expect(box.minLng).toBeLessThanOrEqual(view.minLng)
    expect(box.maxLat).toBeGreaterThanOrEqual(view.maxLat)
    expect(box.maxLng).toBeGreaterThanOrEqual(view.maxLng)
  })

  it('같은 셀 안의 작은 이동은 같은 bbox 로 수렴한다 (쿼리 캐시 히트)', () => {
    const moved = { ...view, minLat: view.minLat + 0.001, maxLat: view.maxLat + 0.001 }
    expect(sameBbox(snapBbox(view, 8, undefined), snapBbox(moved, 8, undefined))).toBe(true)
  })

  it('부동소수 꼬리 없이 소수 6자리 이내로 자른다', () => {
    const box = snapBbox(view, 3, undefined)
    for (const v of [box.minLat, box.minLng, box.maxLat, box.maxLng]) {
      expect(Number(v.toFixed(6))).toBe(v)
    }
  })

  it('region 이 다르면 좌표가 같아도 다른 bbox 다', () => {
    expect(sameBbox(snapBbox(view, 8, undefined), snapBbox(view, 8, 'CAPITAL'))).toBe(false)
  })
})
