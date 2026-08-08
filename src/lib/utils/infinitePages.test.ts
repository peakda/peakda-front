import { describe, it, expect } from 'vitest'
import { flattenPages } from './infinitePages'

// useInfiniteQuery 의 data.pages 를 화면이 쓰는 평탄한 배열로 바꾼다.
// 서버 공통 PageResponse 는 항목을 content 에 담아 준다.
describe('lib/utils/infinitePages', () => {
  it('여러 페이지의 content 를 순서대로 이어 붙인다', () => {
    const pages = [{ content: [1, 2] }, { content: [3] }, { content: [4, 5] }]
    expect(flattenPages({ pages })).toEqual([1, 2, 3, 4, 5])
  })

  it('아직 로딩 전이면 빈 배열', () => {
    expect(flattenPages(undefined)).toEqual([])
  })

  it('페이지가 하나도 없으면 빈 배열', () => {
    expect(flattenPages({ pages: [] })).toEqual([])
  })

  // 파사드가 payload 없을 때 null 을 반환하므로 페이지에 null 이 섞일 수 있다.
  it('null 페이지는 건너뛴다', () => {
    const pages = [{ content: [1] }, null, { content: [2] }]
    expect(flattenPages({ pages })).toEqual([1, 2])
  })

  it('빈 페이지가 섞여도 순서가 유지된다', () => {
    const pages = [{ content: [1] }, { content: [] }, { content: [2] }]
    expect(flattenPages({ pages })).toEqual([1, 2])
  })
})
