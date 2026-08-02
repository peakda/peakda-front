import { useQueryClient } from '@tanstack/react-query'
import {
  postUsersByUserIdBlock,
  getGetUsersMeBlocksQueryKey,
  getUsersMeBlocks,
  deleteUsersByUserIdBlock,
  usePostUsersByUserIdBlock as useBlockGen,
  useGetUsersMeBlocks,
  useDeleteUsersByUserIdBlock as useUnblockGen,
} from '@/api/facades/generated/user-block/user-block'
import type { GetUsersMeBlocksParams } from '@/api/facades/generated/peakdaApi.schemas'

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

export const useBlockedList = (params: GetUsersMeBlocksParams) =>
  useGetUsersMeBlocks(params, { query: { select: (res) => res.data.data ?? null } })

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
