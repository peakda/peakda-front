// 내 기록 전체보기 화면(/my/records) 과 무한 스크롤 목록의 순수 로직.

// 내 프로필에서만 전체보기 링크를 노출한다. 남의 프로필에서는 undefined 를 돌려
// SectionHeader 가 링크 대신 비활성 텍스트를 그리게 한다.
export function myRecordsHref(isMine: boolean): string | undefined {
  return isMine ? '/my/records' : undefined
}

// 목록 헤더의 "N개" 표시. 서버 총계(PageResponse.totalElements)가 있으면 그걸 쓰고,
// 아직 첫 페이지가 안 왔을 때만 지금까지 로드된 개수로 대체한다.
// 0 은 falsy 지만 유효한 총계이므로 ?? 로 판별한다.
export function displayCount(totalElements: number | undefined, loadedLength: number): number {
  return totalElements ?? loadedLength
}

// 무한 쿼리 상태 → sentinel 관찰 여부. 마지막 페이지이거나 이미 가져오는 중이면 관찰하지 않는다.
export function shouldLoadMore(hasNextPage: boolean, isFetchingNextPage: boolean): boolean {
  return hasNextPage && !isFetchingNextPage
}
