import { getUsersById, useGetUsersById } from '@/api/facades/generated/user-profile/user-profile'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function userProfileApi(userId: number) {
  const res = await getUsersById(userId)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useUserProfile = (userId: number | undefined) =>
  useGetUsersById(userId ?? 0, {
    query: { enabled: !!userId, select: (res) => res.data.data ?? null },
  })
