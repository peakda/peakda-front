import { describe, it, expect } from 'vitest'
import { isValidNickname } from './nickname'

// 프로필 설정/편집의 닉네임 클라이언트 검증 — 특수문자 제외 2~10자.
describe('lib/utils/nickname', () => {
  describe('isValidNickname', () => {
    it('한글 2자는 통과한다', () => {
      expect(isValidNickname('피크')).toBe(true)
    })

    it('한글 10자는 통과한다', () => {
      expect(isValidNickname('가나다라마바사아자차')).toBe(true)
    })

    it('영문·숫자 조합도 통과한다', () => {
      expect(isValidNickname('peakda2026')).toBe(true)
    })

    it('한글·영문·숫자 혼용도 통과한다', () => {
      expect(isValidNickname('피크다v2')).toBe(true)
    })

    // 경계값 — 1자는 짧고 11자는 길다.
    it('1자는 거부한다', () => {
      expect(isValidNickname('가')).toBe(false)
    })

    it('11자는 거부한다', () => {
      expect(isValidNickname('가나다라마바사아자차카')).toBe(false)
    })

    it('빈 문자열은 거부한다', () => {
      expect(isValidNickname('')).toBe(false)
    })

    it('특수문자가 섞이면 거부한다', () => {
      expect(isValidNickname('피크다!')).toBe(false)
      expect(isValidNickname('peak_da')).toBe(false)
      expect(isValidNickname('@@@')).toBe(false)
    })

    it('공백이 섞이면 거부한다', () => {
      expect(isValidNickname('피크 다')).toBe(false)
      expect(isValidNickname(' 피크다')).toBe(false)
      expect(isValidNickname('피크다 ')).toBe(false)
    })

    // 조합 중인 자모만 남은 입력은 완성형이 아니므로 거부한다.
    it('자모만 있으면 거부한다', () => {
      expect(isValidNickname('ㄱㄴㄷ')).toBe(false)
      expect(isValidNickname('ㅏㅑ')).toBe(false)
      expect(isValidNickname('피크ㄷ')).toBe(false)
    })
  })
})
