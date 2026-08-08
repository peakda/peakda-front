import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  postUsersByUserIdFollow,
  getUsersByUserIdFollowers,
  getUsersByUserIdFollowings,
  deleteUsersByUserIdFollow,
  usePostUsersByUserIdFollow as useFollowGen,
  useDeleteUsersByUserIdFollow as useUnfollowGen,
} from '@/api/facades/generated/user-follow/user-follow'
import type {
  GetUsersByUserIdFollowersParams,
  GetUsersByUserIdFollowingsParams,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 팔로우 변경 시 여러 userId 의 목록이 동시에 바뀔 수 있어 predicate 로 일괄 무효화한다.
const invalidateFollow = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].includes('/follow'),
  })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function followApi(userId: number) {
  await postUsersByUserIdFollow(userId)
}

export async function unfollowApi(userId: number) {
  await deleteUsersByUserIdFollow(userId)
}

export async function followingsApi(userId: number, params: GetUsersByUserIdFollowingsParams) {
  const res = await getUsersByUserIdFollowings(userId, params)
  return res.data.data ?? null
}

export async function followersApi(userId: number, params: GetUsersByUserIdFollowersParams) {
  const res = await getUsersByUserIdFollowers(userId, params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// 무한 스크롤용. 키에 '/follow' 가 들어가야 invalidateFollow 에 함께 걸린다.

export const useFollowerListInfinite = (userId: number) =>
  useInfiniteQuery({
    queryKey: [`/api/users/${userId}/followers`, 'infinite'],
    queryFn: ({ pageParam }) =>
      followersApi(userId, { pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    // 다른 사용자의 행동으로 바뀌는 값이라 전역 5분을 따르지 않는다 (CLAUDE.md API 호출 규칙)
    staleTime: 0,
  })

export const useFollowingListInfinite = (userId: number) =>
  useInfiniteQuery({
    queryKey: [`/api/users/${userId}/followings`, 'infinite'],
    queryFn: ({ pageParam }) =>
      followingsApi(userId, { pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    // 다른 사용자의 행동으로 바뀌는 값이라 전역 5분을 따르지 않는다 (CLAUDE.md API 호출 규칙)
    staleTime: 0,
  })

// mutate({ userId }) 형태로 호출 → 성공 시 팔로우 관련 캐시 무효화

export const useFollow = () => {
  const queryClient = useQueryClient()
  return useFollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}

export const useUnfollow = () => {
  const queryClient = useQueryClient()
  return useUnfollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}
