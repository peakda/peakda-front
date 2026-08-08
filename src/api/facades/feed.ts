import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  postFeedByIdReactions,
  getFeedById,
  getFeed,
  deleteFeedByIdReactions,
  getGetFeedByIdQueryKey,
  usePostFeedByIdReactions as useAddReactionGen,
  useGetFeedById,
  useDeleteFeedByIdReactions as useRemoveReactionGen,
} from '@/api/facades/generated/feed/feed'
import type {
  PostFeedByIdReactionsParams,
  GetFeedParams,
  GetFeedFilter,
  DeleteFeedByIdReactionsParams,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 리액션은 해당 기록 "상세"만 무효화한다.
// 목록까지 무효화하면 무한 스크롤로 쌓인 모든 페이지를 한꺼번에 다시 불러오면서 스크롤이 튄다.
// 목록 카드의 선택 상태·카운트는 mutation 응답으로 직접 갱신하므로 목록 무효화가 필요 없다.
const invalidateFeedDetail = (queryClient: ReturnType<typeof useQueryClient>, id: number) =>
  queryClient.invalidateQueries({ queryKey: getGetFeedByIdQueryKey(id) })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function feedListApi(params: GetFeedParams) {
  const res = await getFeed(params)
  return res.data.data ?? null
}

export async function feedDetailApi(id: number) {
  const res = await getFeedById(id)
  return res.data.data ?? null
}

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
export const useFeedListInfinite = (filter: GetFeedFilter) =>
  useInfiniteQuery({
    queryKey: ['/api/feed', 'infinite', filter],
    queryFn: ({ pageParam }) =>
      feedListApi({ filter, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
  })

export const useFeedDetail = (id: number | undefined) =>
  useGetFeedById(id ?? 0, { query: { enabled: !!id, select: (res) => res.data.data ?? null } })

// mutate({ id, params: { reactionType } }) 형태로 호출 → 성공 시 해당 기록 상세 캐시만 무효화

export const useAddReaction = () => {
  const queryClient = useQueryClient()
  return useAddReactionGen({
    mutation: { onSuccess: (_res, { id }) => invalidateFeedDetail(queryClient, id) },
  })
}

export const useRemoveReaction = () => {
  const queryClient = useQueryClient()
  return useRemoveReactionGen({
    mutation: { onSuccess: (_res, { id }) => invalidateFeedDetail(queryClient, id) },
  })
}
