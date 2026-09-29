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
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'
import { track } from '@/lib/analytics'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// 李?紐⑸줉 罹먯떆 ????mutation ?깃났 ??臾댄슚?????
const favoriteListKey = getGetSpotsFavoritesQueryKey()

const invalidateFavoriteViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: favoriteListKey })
  void queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0]
      return typeof key === 'string' &&
        (/^\/api\/spots\/\d+$/.test(key) ||
          key.startsWith('/api/explore') ||
          key.startsWith('/api/search') ||
          key.startsWith('/api/spots/preview'))
    },
  })
}

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

// 비로그인은 /my 를 둘러볼 수 있으므로 401 로 끝날 요청을 보내지 않는다.
export const useFavoriteList = () => {
  const isLoggedIn = useIsLoggedIn()
  return useGetSpotsFavorites({
    query: { enabled: isLoggedIn, select: (res) => res.data.data ?? null },
  })
}

// mutate({ spotId }) ?뺥깭濡??몄텧 ???깃났 ??李?紐⑸줉 罹먯떆 臾댄슚??

// 찜 버튼이 상세·카드·지도 드로어에 흩어져 있어 이벤트는 성공 시점인 여기서 한 번만 보낸다.
export const useAddFavorite = () => {
  const queryClient = useQueryClient()
  return useAddGen({
    mutation: {
      onSuccess: (_, { spotId }) => {
        track('spot_save', { spot_id: spotId })
        invalidateFavoriteViews(queryClient)
      },
    },
  })
}

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient()
  return useRemoveGen({
    mutation: {
      onSuccess: (_, { spotId }) => {
        track('spot_unsave', { spot_id: spotId })
        invalidateFavoriteViews(queryClient)
      },
    },
  })
}

// mutate({ spotId, data: { enabled } }) ?뺥깭濡??몄텧
export const useUpdateFavoriteNotify = () => {
  const queryClient = useQueryClient()
  return useUpdateNotifyGen({
    mutation: {
      // 찜을 추가하면 만개 알림이 기본으로 켜져 이 요청 없이도 알림이 걸린다. 여기서는 사용자가 바꾼 것만 잡힌다.
      onSuccess: (_, { spotId, data }) => {
        track(data.enabled ? 'bloom_alert_on' : 'bloom_alert_off', { spot_id: spotId })
        invalidateFavoriteViews(queryClient)
      },
    },
  })
}
