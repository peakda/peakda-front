import { describe, it, expect } from 'vitest'
import { nextPageParam } from './pagination'

describe('facades/pagination', () => {
  it('hasNext 가 true 면 다음 페이지 번호를 준다', () => {
    expect(nextPageParam({ page: 0, hasNext: true })).toBe(1)
    expect(nextPageParam({ page: 4, hasNext: true })).toBe(5)
  })

  it('마지막 페이지면 undefined 로 멈춘다', () => {
    expect(nextPageParam({ page: 3, hasNext: false })).toBeUndefined()
  })

  it('응답이 없으면(에러·빈 payload) 멈춘다', () => {
    expect(nextPageParam(null)).toBeUndefined()
  })
})
