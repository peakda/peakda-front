import { vi, describe, it, expect, afterEach } from 'vitest'
import { readStorage, removeStorage, writeStorage } from './storage'

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('정상 환경에서는 localStorage 를 그대로 읽고 쓴다', () => {
    writeStorage('k', 'v')
    expect(readStorage('k')).toBe('v')
    removeStorage('k')
    expect(readStorage('k')).toBeNull()
  })

  it('접근이 막힌 환경(시크릿·용량 초과)에서도 던지지 않는다', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(readStorage('k')).toBeNull()
    expect(() => writeStorage('k', 'v')).not.toThrow()
    expect(() => removeStorage('k')).not.toThrow()
    expect(warn).toHaveBeenCalledTimes(2)
  })
})
