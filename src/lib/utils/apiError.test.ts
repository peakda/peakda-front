import { describe, it, expect } from 'vitest'
import {
  ApiError,
  getApiErrorMessage,
  getApiErrorStatus,
  isApiErrorStatus,
  shouldRetryQuery,
} from './apiError'

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

describe('ApiError', () => {
  it('Error 를 상속하고 기존 { response: { status, data } } 모양을 유지한다', () => {
    const error = new ApiError(404, { code: 'NOT_FOUND', message: '없음' })
    expect(error).toBeInstanceOf(Error)
    expect(error.stack).toBeDefined()
    expect(isApiErrorStatus(error, 404)).toBe(true)
    expect(shouldRetryQuery(0, new ApiError(503, null))).toBe(true)
  })

  it('getApiErrorMessage 는 본문의 message 문자열만 꺼낸다', () => {
    expect(getApiErrorMessage(new ApiError(409, { code: 'DUP', message: '중복' }))).toBe('중복')
    expect(getApiErrorMessage(new ApiError(502, null))).toBeUndefined()
    expect(getApiErrorMessage(new ApiError(400, { message: 1 }))).toBeUndefined()
    expect(getApiErrorMessage(new Error('network'))).toBeUndefined()
    expect(getApiErrorMessage(null)).toBeUndefined()
  })
})
