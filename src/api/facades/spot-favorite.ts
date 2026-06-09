import { useQueryClient } from '@tanstack/react-query'
import {
  add,
  getListQueryKey,
  list,
  remove,
  updateNotify,
  useAdd as useAddGen,
  useList,
  useRemove as useRemoveGen,
  useUpdateNotify as useUpdateNotifyGen,
} from '@/api/generated/spot-favorite/spot-favorite'
import type { UpdateFavoriteNotifyRequest } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 찜 목록 캐시 키 — mutation 성공 시 무효화 대상
const favoriteListKey = getListQueryKey()

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function addFavoriteApi(spotId: number) {
  const res = await add(spotId)
  return res.data.data ?? null
}

export async function removeFavoriteApi(spotId: number) {
  await remove(spotId)
}

export async function updateFavoriteNotifyApi(spotId: number, payload: UpdateFavoriteNotifyRequest) {
  const res = await updateNotify(spotId, payload)
  return res.data.data ?? null
}

export async function favoriteListApi() {
  const res = await list()
  return res.data.data ?? null
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const useFavoriteList = () =>
  useList({ query: { select: (res) => res.data.data ?? null } })

// mutate({ spotId }) 형태로 호출 — 성공 시 찜 목록 캐시 무효화

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

// mutate({ spotId, data: { enabled } }) 형태로 호출
export const useUpdateFavoriteNotify = () => {
  const queryClient = useQueryClient()
  return useUpdateNotifyGen({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: favoriteListKey }) },
  })
}
