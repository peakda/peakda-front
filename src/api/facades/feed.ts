import { useQueryClient } from '@tanstack/react-query'
import {
  addReaction,
  get1,
  list4,
  removeReaction,
  useAddReaction as useAddReactionGen,
  useGet1,
  useList4,
  useRemoveReaction as useRemoveReactionGen,
} from '@/api/facades/generated/feed/feed'
import type {
  AddReactionParams,
  List4Params,
  RemoveReactionParams,
} from '@/api/facades/generated/peakdaApi.schemas'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 리액션 변경 시 피드 목록·상세 모두 무효화 → '/api/feed' 프리픽스로 일괄 처리
const invalidateFeed = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/feed'),
  })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function feedListApi(params: List4Params) {
  const res = await list4(params)
  return res.data.data ?? null
}

export async function feedDetailApi(id: number) {
  const res = await get1(id)
  return res.data.data ?? null
}

export async function addReactionApi(id: number, params: AddReactionParams) {
  const res = await addReaction(id, params)
  return res.data.data ?? null
}

export async function removeReactionApi(id: number, params: RemoveReactionParams) {
  const res = await removeReaction(id, params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useFeedList = (params: List4Params) =>
  useList4(params, { query: { select: (res) => res.data.data ?? null } })

export const useFeedDetail = (id: number | undefined) =>
  useGet1(id ?? 0, { query: { enabled: !!id, select: (res) => res.data.data ?? null } })

// mutate({ id, params: { reactionType } }) 형태로 호출 → 성공 시 피드 캐시 무효화

export const useAddReaction = () => {
  const queryClient = useQueryClient()
  return useAddReactionGen({ mutation: { onSuccess: () => invalidateFeed(queryClient) } })
}

export const useRemoveReaction = () => {
  const queryClient = useQueryClient()
  return useRemoveReactionGen({ mutation: { onSuccess: () => invalidateFeed(queryClient) } })
}
