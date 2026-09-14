import { describe, it, expect } from 'vitest'
import { isApiErrorStatus } from './apiError'

// customInstance 가 던지는 에러 모양에서 HTTP 상태를 판정한다. 서버 페이지의 notFound() 분기에 쓴다.
describe('lib/utils/apiError', () => {
  it('상태가 같으면 true', () => {
    expect(isApiErrorStatus({ response: { status: 404, data: null } }, 404)).toBe(true)
  })

  it('상태가 다르면 false', () => {
    expect(isApiErrorStatus({ response: { status: 500, data: null } }, 404)).toBe(false)
  })

  it('response 가 없는 일반 Error 면 false', () => {
    expect(isApiErrorStatus(new Error('network'), 404)).toBe(false)
  })

  it('response 가 null 이면 false', () => {
    expect(isApiErrorStatus({ response: null }, 404)).toBe(false)
  })

  it('null·문자열이면 false', () => {
    expect(isApiErrorStatus(null, 404)).toBe(false)
    expect(isApiErrorStatus('404', 404)).toBe(false)
  })
})
