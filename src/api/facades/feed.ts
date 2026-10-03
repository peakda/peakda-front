import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  postFeedByIdReactions,
  deleteFeedByIdReactions,
  getGetFeedByIdQueryKey,
  usePostFeedByIdReactions as useAddReactionGen,
  useDeleteFeedByIdReactions as useRemoveReactionGen,
} from '@/api/facades/generated/feed/feed'
import type {
  PostFeedByIdReactionsParams,
  GetFeedFilter,
  DeleteFeedByIdReactionsParams,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'
import { useSsrInitialQuery } from '@/hooks/useSsrInitialQuery'
import type {
  PageResponseSpotRecordSummaryResponse,
  SpotRecordResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { feedDetailApi } from '@/api/facades/feed-detail'
import { feedListApi } from '@/api/facades/feed-list'
import { track } from '@/lib/analytics'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 리액션은 해당 기록 "상세"만 무효화한다.
// 목록까지 무효화하면 무한 스크롤로 쌓인 모든 페이지를 한꺼번에 다시 불러오면서 스크롤이 튄다.
// 목록 카드의 선택 상태·카운트는 mutation 응답으로 직접 갱신하므로 목록 무효화가 필요 없다.
const invalidateFeedDetail = (queryClient: ReturnType<typeof useQueryClient>, id: number) =>
  queryClient.invalidateQueries({ queryKey: getGetFeedByIdQueryKey(id) })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

// options 는 서버 컴포넌트에서 캐시 설정(next.revalidate)을 넘길 때 쓴다.
export async function addReactionApi(id: number, params: PostFeedByIdReactionsParams) {
  const res = await postFeedByIdReactions(id, params)
  return res.data.data ?? null
}

export async function removeReactionApi(id: number, params: DeleteFeedByIdReactionsParams) {
  const res = await deleteFeedByIdReactions(id, params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// 무한 스크롤용. 기록 삭제 시 '/api/feed' 프리픽스 무효화에 함께 걸린다.
// initialPage 는 서버가 받은 '전체' 탭 첫 페이지다. 비로그인 기준이라 로그인 사용자는 내 리액션을 채우려
// 하이드레이션 직후 한 번 다시 조회한다. 다른 탭(관심 식물·팔로잉)에는 넘기지 않는다.
export const useFeedListInfinite = (
  filter: GetFeedFilter,
  initialPage?: PageResponseSpotRecordSummaryResponse
) => {
  // initialData 객체는 렌더마다 새로 만들어지므로 첫 페이지 참조로 초기값인지 판정한다.
  const ssr = useSsrInitialQuery<InfiniteData<PageResponseSpotRecordSummaryResponse | null, number>>(
    (data) => data?.pages[0] === initialPage
  )
  return useInfiniteQuery({
    queryKey: ['/api/feed', 'infinite', filter],
    queryFn: ({ pageParam }) =>
      feedListApi({ filter, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
    ...ssr,
  })
}

export const useFeedDetail = (id: number | undefined, initialRecord?: SpotRecordResponse) => {
  // 서버 HTML 은 비로그인 기준이라, 로그인 사용자는 내 리액션 상태를 채우려 하이드레이션 직후 한 번 다시 조회한다.
  const ssr = useSsrInitialQuery<SpotRecordResponse | null>((data) => data === initialRecord)
  return useQuery({
    queryKey: getGetFeedByIdQueryKey(id ?? 0),
    queryFn: () => feedDetailApi(id!),
    enabled: !!id && ssr.enabled,
    initialData: initialRecord,
    staleTime: ssr.staleTime,
  })
}

// mutate({ id, params: { reactionType } }) 형태로 호출 → 성공 시 해당 기록 상세 캐시만 무효화

export const useAddReaction = () => {
  const queryClient = useQueryClient()
  return useAddReactionGen({
    mutation: {
      onSuccess: (_res, { id, params }) => {
        track('reaction_add', { record_id: id, reaction_type: params.reactionType })
        invalidateFeedDetail(queryClient, id)
      },
    },
  })
}

export const useRemoveReaction = () => {
  const queryClient = useQueryClient()
  return useRemoveReactionGen({
    mutation: {
      onSuccess: (_res, { id, params }) => {
        track('reaction_remove', { record_id: id, reaction_type: params.reactionType })
        invalidateFeedDetail(queryClient, id)
      },
    },
  })
}
