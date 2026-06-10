import { useQueryClient } from '@tanstack/react-query'
import {
  follow,
  followers,
  followings,
  summary,
  unfollow,
  useFollow as useFollowGen,
  useFollowers,
  useFollowings,
  useSummary,
  useUnfollow as useUnfollowGen,
} from '@/api/generated/user-follow/user-follow'
import type { FollowersParams, FollowingsParams } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 팔로우 변경 시 무효화 대상 — 여러 userId 의 summary·목록이 동시에 바뀌므로 predicate 로 일괄 처리한다.
const invalidateFollow = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].includes('/follow'),
  })

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function followApi(userId: number) {
  await follow(userId)
}

export async function unfollowApi(userId: number) {
  await unfollow(userId)
}

export async function followingsApi(userId: number, params: FollowingsParams) {
  const res = await followings(userId, params)
  return res.data.data ?? null
}

export async function followersApi(userId: number, params: FollowersParams) {
  const res = await followers(userId, params)
  return res.data.data ?? null
}

export async function followSummaryApi(userId: number) {
  const res = await summary(userId)
  return res.data.data ?? null
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const useFollowSummary = (userId: number) =>
  useSummary(userId, { query: { select: (res) => res.data.data ?? null } })

export const useFollowingList = (userId: number, params: FollowingsParams) =>
  useFollowings(userId, params, { query: { select: (res) => res.data.data ?? null } })

export const useFollowerList = (userId: number, params: FollowersParams) =>
  useFollowers(userId, params, { query: { select: (res) => res.data.data ?? null } })

// mutate({ userId }) 형태로 호출 — 성공 시 팔로우 관련 캐시 무효화

export const useFollow = () => {
  const queryClient = useQueryClient()
  return useFollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}

export const useUnfollow = () => {
  const queryClient = useQueryClient()
  return useUnfollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}
