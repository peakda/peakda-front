import { useQueryClient } from '@tanstack/react-query'
import {
  postFeedByIdReactions,
  getFeedById,
  getFeed,
  deleteFeedByIdReactions,
  usePostFeedByIdReactions as useAddReactionGen,
  useGetFeedById,
  useGetFeed,
  useDeleteFeedByIdReactions as useRemoveReactionGen,
} from '@/api/facades/generated/feed/feed'
import type {
  PostFeedByIdReactionsParams,
  GetFeedParams,
  DeleteFeedByIdReactionsParams,
} from '@/api/facades/generated/peakdaApi.schemas'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 리액션 변경 시 피드 목록·상세 모두 무효화 → '/api/feed' 프리픽스로 일괄 처리
const invalidateFeed = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/feed'),
  })

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

export const useFeedList = (params: GetFeedParams) =>
  useGetFeed(params, { query: { select: (res) => res.data.data ?? null } })

export const useFeedDetail = (id: number | undefined) =>
  useGetFeedById(id ?? 0, { query: { enabled: !!id, select: (res) => res.data.data ?? null } })

// mutate({ id, params: { reactionType } }) 형태로 호출 → 성공 시 피드 캐시 무효화

export const useAddReaction = () => {
  const queryClient = useQueryClient()
  return useAddReactionGen({ mutation: { onSuccess: () => invalidateFeed(queryClient) } })
}

export const useRemoveReaction = () => {
  const queryClient = useQueryClient()
  return useRemoveReactionGen({ mutation: { onSuccess: () => invalidateFeed(queryClient) } })
}
