import { useQueryClient } from '@tanstack/react-query'
import {
  postUsersByUserIdFollow,
  getUsersByUserIdFollowers,
  getUsersByUserIdFollowings,
  getUsersByUserIdFollowSummary,
  deleteUsersByUserIdFollow,
  usePostUsersByUserIdFollow as useFollowGen,
  useGetUsersByUserIdFollowers,
  useGetUsersByUserIdFollowings,
  useGetUsersByUserIdFollowSummary,
  useDeleteUsersByUserIdFollow as useUnfollowGen,
} from '@/api/facades/generated/user-follow/user-follow'
import type { GetUsersByUserIdFollowersParams, GetUsersByUserIdFollowingsParams } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// ?붾줈??蹂寃???臾댄슚????????щ윭 userId ??summary쨌紐⑸줉???숈떆??諛붾뚮?濡?predicate 濡??쇨큵 泥섎━?쒕떎.
const invalidateFollow = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].includes('/follow'),
  })

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

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

export async function followSummaryApi(userId: number) {
  const res = await getUsersByUserIdFollowSummary(userId)
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useFollowSummary = (userId: number | undefined) =>
  useGetUsersByUserIdFollowSummary(userId ?? 0, { query: { enabled: !!userId, select: (res) => res.data.data ?? null } })

export const useFollowingList = (userId: number, params: GetUsersByUserIdFollowingsParams) =>
  useGetUsersByUserIdFollowings(userId, params, { query: { select: (res) => res.data.data ?? null } })

export const useFollowerList = (userId: number, params: GetUsersByUserIdFollowersParams) =>
  useGetUsersByUserIdFollowers(userId, params, { query: { select: (res) => res.data.data ?? null } })

// mutate({ userId }) ?뺥깭濡??몄텧 ???깃났 ???붾줈??愿??罹먯떆 臾댄슚??

export const useFollow = () => {
  const queryClient = useQueryClient()
  return useFollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}

export const useUnfollow = () => {
  const queryClient = useQueryClient()
  return useUnfollowGen({ mutation: { onSuccess: () => invalidateFollow(queryClient) } })
}
