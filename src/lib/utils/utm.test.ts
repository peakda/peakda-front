import { describe, it, expect } from 'vitest'
import { withUtmParams } from '@/lib/utils/utm'

describe('withUtmParams', () => {
  it('utm_* 만 골라 이어 붙인다', () => {
    expect(withUtmParams('/map', '?utm_source=kakao&utm_medium=social&tab=spot')).toBe(
      '/map?utm_source=kakao&utm_medium=social'
    )
  })

  it('경로에 쿼리가 이미 있으면 & 로 잇는다', () => {
    expect(withUtmParams('/map?login=1', '?utm_source=kakao')).toBe(
      '/map?login=1&utm_source=kakao'
    )
  })

  it('utm 이 없으면 경로를 그대로 돌려준다', () => {
    expect(withUtmParams('/map', '')).toBe('/map')
    expect(withUtmParams('/map', '?tab=spot')).toBe('/map')
  })
})
