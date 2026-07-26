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
} from '@/api/facades/generated/user-follow/user-follow'
import type { FollowersParams, FollowingsParams } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// ?붾줈??蹂寃???臾댄슚????????щ윭 userId ??summary쨌紐⑸줉???숈떆??諛붾뚮?濡?predicate 濡??쇨큵 泥섎━?쒕떎.
const invalidateFollow = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].includes('/follow'),
  })

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

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

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useFollowSummary = (userId: number | undefined) =>
  useSummary(userId ?? 0, { query: { enabled: !!userId, select: (res) => res.data.data ?? null } })

export const useFollowingList = (userId: number, params: FollowingsParams) =>
  useFollowings(userId, params, { query: { select: (res) => res.data.data ?? null } })

export const useFollowerList = (userId: number, params: FollowersParams) =>
  useFollowers(userId, params, { query: { select: (res) => res.data.data ?? null } })

// mutate({ userId }) ?뺥깭濡??몄텧 ???깃났 ???붾줈??愿??罹먯떆 臾댄슚??

export const useFollow = () => {
  const queryClient = useQueryClient()
  return useFollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}

export const useUnfollow = () => {
  const queryClient = useQueryClient()
  return useUnfollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}
