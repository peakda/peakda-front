// 목록 API 공통 페이징 상수·헬퍼.
// 서버 공통 PageResponse 는 page(0-based)와 hasNext 를 항상 내려준다.

// 서버 허용 최대 size 는 50. 목록은 20 으로 통일한다.
export const PAGE_SIZE = 20

// 공통 페이지 응답 → 다음 페이지 번호. hasNext 가 false 거나 응답이 없으면 undefined 로 멈춘다.
export const nextPageParam = (last: { page: number; hasNext: boolean } | null) =>
  last?.hasNext ? last.page + 1 : undefined
