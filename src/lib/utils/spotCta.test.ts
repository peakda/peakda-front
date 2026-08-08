import { describe, it, expect } from 'vitest'
import { buildMapUrl, buildRecordUrl, canUseWebShare, isShareAbort } from './spotCta'

// 스팟/축제 상세의 CTA 링크 조립과 공유 API 판정.
describe('lib/utils/spotCta', () => {
  describe('buildMapUrl', () => {
    it('위도·경도가 모두 있으면 쿼리를 붙인다', () => {
      expect(buildMapUrl({ latitude: 37.5665, longitude: 126.978 })).toBe(
        '/map?lat=37.5665&lng=126.978'
      )
    })

    // 0 은 유효한 좌표다 — falsy 라고 버리면 안 된다.
    it('좌표가 0 이어도 유효한 값으로 취급한다', () => {
      expect(buildMapUrl({ latitude: 0, longitude: 0 })).toBe('/map?lat=0&lng=0')
    })

    it('위도만 있으면 쿼리 없이 /map', () => {
      expect(buildMapUrl({ latitude: 37.5665 })).toBe('/map')
    })

    it('경도만 있으면 쿼리 없이 /map', () => {
      expect(buildMapUrl({ longitude: 126.978 })).toBe('/map')
    })

    it('둘 다 null 이면 /map', () => {
      expect(buildMapUrl({ latitude: null, longitude: null })).toBe('/map')
    })

    it('둘 다 undefined 이면 /map', () => {
      expect(buildMapUrl({})).toBe('/map')
    })
  })

  describe('buildRecordUrl', () => {
    it('spotId 가 있으면 쿼리를 붙인다', () => {
      expect(buildRecordUrl(12)).toBe('/record?spotId=12')
    })

    it('spotId 가 undefined 면 /record', () => {
      expect(buildRecordUrl(undefined)).toBe('/record')
    })

    it('spotId 가 null 이면 /record', () => {
      expect(buildRecordUrl(null)).toBe('/record')
    })

    it('인자가 없으면 /record', () => {
      expect(buildRecordUrl()).toBe('/record')
    })
  })

  describe('canUseWebShare', () => {
    it('share 함수가 있으면 true', () => {
      expect(canUseWebShare({ share: () => Promise.resolve() })).toBe(true)
    })

    it('share 가 없으면 false', () => {
      expect(canUseWebShare({})).toBe(false)
    })

    it('navigator 자체가 없으면 false (SSR)', () => {
      expect(canUseWebShare(undefined)).toBe(false)
    })
  })

  describe('isShareAbort', () => {
    // 사용자가 공유 시트를 닫으면 AbortError 가 난다 — 에러 토스트를 띄우면 안 된다.
    it('AbortError 면 true', () => {
      expect(isShareAbort(new DOMException('취소됨', 'AbortError'))).toBe(true)
    })

    it('일반 Error 면 false', () => {
      expect(isShareAbort(new Error('실패'))).toBe(false)
    })

    it('문자열이면 false', () => {
      expect(isShareAbort('AbortError')).toBe(false)
    })

    it('null 이면 false', () => {
      expect(isShareAbort(null)).toBe(false)
    })
  })
})
