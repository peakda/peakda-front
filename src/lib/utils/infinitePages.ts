/**
 * useInfiniteQuery 의 data 를 화면이 바로 map 할 수 있는 평탄한 배열로 바꾼다.
 * 서버 공통 PageResponse 는 항목을 content 에 담아 주고,
 * 파사드는 payload 가 없을 때 null 을 반환하므로 페이지에 null 이 섞일 수 있다.
 */
export function flattenPages<T>(
  data: { pages: ({ content: T[] } | null)[] } | undefined
): T[] {
  return (data?.pages ?? []).flatMap((page) => page?.content ?? [])
}
