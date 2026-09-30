import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getGetExploreFestivalsQueryKey,
  getGetExploreQueryKey,
} from '@/api/facades/generated/explore/explore'
import type {
  ExploreFestivalListResponse,
  ExploreResponse,
  GetExploreFestivalsParams,
  GetExploreParams,
  GetExploreSpotsSection,
  GetExploreSpotsCategory,
  PageResponseExploreSpotItem,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'
import { exploreCurationApi } from '@/api/facades/explore-curation'
import { exploreFestivalsApi } from '@/api/facades/explore-festivals'
import { exploreSpotsApi } from '@/api/facades/explore-spots'
import { useSsrInitialQuery } from '@/hooks/useSsrInitialQuery'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 탐색 큐레이션 — 절정/다음 주/축제/큐레이션 4개 섹션을 한 번에 준다.
// 키는 generated 키를 그대로 쓴다 — 찜 변경 시 '/api/explore' 프리픽스 무효화에 걸려야 한다.
export const useExploreCuration = (params?: GetExploreParams, initialExplore?: ExploreResponse) => {
  // 서버 HTML 은 비로그인 기준이라, 로그인 사용자는 찜·알림 상태를 채우려 하이드레이션 직후 한 번 다시 조회한다.
  const ssr = useSsrInitialQuery<ExploreResponse | null>((data) => data === initialExplore)
  return useQuery({
    queryKey: getGetExploreQueryKey(params),
    queryFn: () => exploreCurationApi(params),
    initialData: initialExplore,
    ...ssr,
  })
}

// 탐색 스팟 섹션 전체 보기 — section(PEAK_NOW | NEXT_WEEK) 필수.
// 무한 스크롤용. category 가 바뀌면 페이지가 처음부터 다시 쌓인다.
// initialPage 는 서버에서 받은 첫 페이지(0번)다. 로그인 사용자는 찜·알림 상태를 채우려 하이드레이션 직후 한 번 다시 조회한다.
export const useExploreSpotsInfinite = (
  section: GetExploreSpotsSection,
  category?: GetExploreSpotsCategory,
  initialPage?: PageResponseExploreSpotItem
) => {
  // initialData 객체는 렌더마다 새로 만들어지므로 첫 페이지 참조로 초기값인지 판정한다.
  const ssr = useSsrInitialQuery<InfiniteData<PageResponseExploreSpotItem | null, number>>(
    (data) => data?.pages[0] === initialPage
  )
  return useInfiniteQuery({
    queryKey: ['/api/explore/spots', 'infinite', section, category ?? null],
    queryFn: ({ pageParam }) =>
      exploreSpotsApi({ section, category, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
    ...ssr,
  })
}

// 진행 중 꽃축제 전체 보기 — 페이징 없이 전량.
// 사용자별 상태가 없어 로그인 여부와 관계없이 서버 초기값을 전역 staleTime 동안 그대로 쓴다.
export const useExploreFestivals = (
  params?: GetExploreFestivalsParams,
  initialFestivals?: ExploreFestivalListResponse
) =>
  useQuery({
    queryKey: getGetExploreFestivalsQueryKey(params),
    queryFn: () => exploreFestivalsApi(params),
    initialData: initialFestivals,
  })
