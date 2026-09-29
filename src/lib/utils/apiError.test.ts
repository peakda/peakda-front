import { describe, it, expect } from 'vitest'
import { getApiErrorStatus, isApiErrorStatus, shouldRetryQuery } from './apiError'

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

  it('getApiErrorStatus 는 status 가 숫자가 아니면 undefined', () => {
    expect(getApiErrorStatus({ response: { status: 502 } })).toBe(502)
    expect(getApiErrorStatus({ response: { status: '502' } })).toBeUndefined()
    expect(getApiErrorStatus(new SyntaxError('Unexpected token <'))).toBeUndefined()
  })
})

describe('shouldRetryQuery', () => {
  it('4xx 는 재시도하지 않는다', () => {
    for (const status of [400, 401, 403, 404, 409, 429]) {
      expect(shouldRetryQuery(0, { response: { status, data: null } })).toBe(false)
    }
  })

  it('5xx·네트워크 오류는 한 번만 재시도한다', () => {
    expect(shouldRetryQuery(0, { response: { status: 502, data: null } })).toBe(true)
    expect(shouldRetryQuery(0, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetryQuery(1, { response: { status: 502, data: null } })).toBe(false)
    expect(shouldRetryQuery(1, new TypeError('Failed to fetch'))).toBe(false)
  })
})
