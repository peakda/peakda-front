import { useQueryClient } from '@tanstack/react-query'
import {
  postSpotsFavoritesBySpotId,
  getGetSpotsFavoritesQueryKey,
  getSpotsFavorites,
  deleteSpotsFavoritesBySpotId,
  patchSpotsFavoritesBySpotIdNotify,
  usePostSpotsFavoritesBySpotId as useAddGen,
  useGetSpotsFavorites,
  useDeleteSpotsFavoritesBySpotId as useRemoveGen,
  usePatchSpotsFavoritesBySpotIdNotify as useUpdateNotifyGen,
} from '@/api/facades/generated/spot-favorite/spot-favorite'
import type { UpdateFavoriteNotifyRequest } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// 李?紐⑸줉 罹먯떆 ????mutation ?깃났 ??臾댄슚?????
const favoriteListKey = getGetSpotsFavoritesQueryKey()

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function addFavoriteApi(spotId: number) {
  const res = await postSpotsFavoritesBySpotId(spotId)
  return res.data.data ?? null
}

export async function removeFavoriteApi(spotId: number) {
  await deleteSpotsFavoritesBySpotId(spotId)
}

export async function updateFavoriteNotifyApi(spotId: number, payload: UpdateFavoriteNotifyRequest) {
  const res = await patchSpotsFavoritesBySpotIdNotify(spotId, payload)
  return res.data.data ?? null
}

export async function favoriteListApi() {
  const res = await getSpotsFavorites()
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useFavoriteList = () =>
  useGetSpotsFavorites({ query: { select: (res) => res.data.data ?? null } })

// mutate({ spotId }) ?뺥깭濡??몄텧 ???깃났 ??李?紐⑸줉 罹먯떆 臾댄슚??

export const useAddFavorite = () => {
  const queryClient = useQueryClient()
  return useAddGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: favoriteListKey }) },
  })
}

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient()
  return useRemoveGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: favoriteListKey }) },
  })
}

// mutate({ spotId, data: { enabled } }) ?뺥깭濡??몄텧
export const useUpdateFavoriteNotify = () => {
  const queryClient = useQueryClient()
  return useUpdateNotifyGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: favoriteListKey }) },
  })
}
