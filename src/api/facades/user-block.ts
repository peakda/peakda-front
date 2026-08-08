import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  postUsersByUserIdBlock,
  getGetUsersMeBlocksQueryKey,
  getUsersMeBlocks,
  deleteUsersByUserIdBlock,
  usePostUsersByUserIdBlock as useBlockGen,
  useDeleteUsersByUserIdBlock as useUnblockGen,
} from '@/api/facades/generated/user-block/user-block'
import type { GetUsersMeBlocksParams } from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 차단 목록 캐시 키 — mutation 성공 시 무효화에 사용
const blockedListKey = getGetUsersMeBlocksQueryKey()

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function blockUserApi(userId: number) {
  await postUsersByUserIdBlock(userId)
}

export async function unblockUserApi(userId: number) {
  await deleteUsersByUserIdBlock(userId)
}

export async function blockedListApi(params: GetUsersMeBlocksParams) {
  const res = await getUsersMeBlocks(params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// 무한 스크롤용. blockedListKey 프리픽스를 공유해 차단/해제 시 함께 무효화된다.
export const useBlockedListInfinite = () =>
  useInfiniteQuery({
    queryKey: [...blockedListKey, 'infinite'],
    queryFn: ({ pageParam }) => blockedListApi({ pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    // 즉시 반영이 필요한 목록이라 전역 5분을 따르지 않는다 (CLAUDE.md API 호출 규칙)
    staleTime: 0,
  })

// mutate({ userId }) 형태로 호출 → 성공 시 차단 목록 캐시 무효화

export const useBlockUser = () => {
  const queryClient = useQueryClient()
  return useBlockGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: blockedListKey }) },
  })
}

export const useUnblockUser = () => {
  const queryClient = useQueryClient()
  return useUnblockGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: blockedListKey }) },
  })
}
