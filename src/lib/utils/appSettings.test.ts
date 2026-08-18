import { describe, it, expect } from 'vitest'
import { DEFAULT_APP_SETTINGS, readAppSettings } from './appSettings'

describe('utils/appSettings', () => {
  describe('readAppSettings', () => {
    it('null 이면 기본값(둘 다 켜짐)', () => {
      expect(readAppSettings(null)).toEqual({ locationEnabled: true, exifEnabled: true })
    })
    it('빈 문자열이면 기본값', () => {
      expect(readAppSettings('')).toEqual(DEFAULT_APP_SETTINGS)
    })
    it('깨진 JSON 이면 기본값', () => {
      expect(readAppSettings('{ not json')).toEqual(DEFAULT_APP_SETTINGS)
    })
    it('객체가 아닌 JSON 이면 기본값', () => {
      expect(readAppSettings('true')).toEqual(DEFAULT_APP_SETTINGS)
    })
    it('배열이면 기본값', () => {
      expect(readAppSettings('[]')).toEqual(DEFAULT_APP_SETTINGS)
    })
    it('null JSON 이면 기본값', () => {
      expect(readAppSettings('null')).toEqual(DEFAULT_APP_SETTINGS)
    })
    it('정상 값이면 그대로 반환', () => {
      expect(readAppSettings('{"locationEnabled":false,"exifEnabled":false}')).toEqual({
        locationEnabled: false,
        exifEnabled: false,
      })
    })
    it('일부 키만 있으면 없는 키는 기본값', () => {
      expect(readAppSettings('{"locationEnabled":false}')).toEqual({
        locationEnabled: false,
        exifEnabled: true,
      })
    })
    it('불리언이 아닌 값은 기본값으로 대체', () => {
      expect(readAppSettings('{"locationEnabled":"false","exifEnabled":0}')).toEqual({
        locationEnabled: true,
        exifEnabled: true,
      })
    })
    it('모르는 키는 무시한다', () => {
      expect(readAppSettings('{"exifEnabled":false,"unknown":1}')).toEqual({
        locationEnabled: true,
        exifEnabled: false,
      })
    })
  })
})
