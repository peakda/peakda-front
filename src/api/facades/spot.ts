import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  postSpotsMatch,
  getSpotsPreview,
  getGetSpotsByIdQueryOptions,
  useGetSpotsPreview,
  usePostSpotsMatch as useMatchGen,
  useGetSpotsById,
} from '@/api/facades/generated/spot/spot'
import type { SpotMatchRequest } from '@/api/facades/generated/peakdaApi.schemas'

export async function matchSpotApi(payload: SpotMatchRequest) {
  const res = await postSpotsMatch(payload)
  return res.data.data ?? null
}

export const useMatchSpot = () => useMatchGen()

// 지도 핀 클릭처럼 렌더 밖에서 상세가 필요할 때 쓴다.
// useSpotDetail(/spot/[id])과 같은 캐시를 공유하므로, 같은 핀을 다시 눌러도 ·
// 드로어에서 상세 페이지로 넘어가도 staleTime 안에서는 재요청하지 않는다.
export const useSpotDetailFetcher = () => {
  const queryClient = useQueryClient()

  return useCallback(
    async (id: number) => {
      const res = await queryClient.fetchQuery(getGetSpotsByIdQueryOptions(id))
      return res.data.data ?? null
    },
    [queryClient]
  )
}

// id 가 아직 없으면(선행 조회 대기) 요청하지 않는다.
export const useSpotDetail = (id: number | undefined) =>
  useGetSpotsById(id ?? 0, { query: { enabled: !!id, select: (res) => res.data.data ?? null } })

// 이벤트(핀 클릭 등)에서 프리뷰를 즉시 조회할 때 사용하는 plain async.
// spotIds 가 비면 요청하지 않는다.
export async function spotPreviewApi(spotIds: number[], coords?: { lat: number; lng: number }) {
  if (spotIds.length === 0) return null
  const res = await getSpotsPreview({ spotIds, ...(coords ?? {}) })
  return res.data.data ?? null
}

// 스팟 id 목록으로 프리뷰 카드(썸네일·거리·뱃지) 조회. coords 전달 시 거리 계산.
// spotIds 가 비면 요청하지 않는다.
export const useSpotPreview = (spotIds: number[], coords?: { lat: number; lng: number }) =>
  useGetSpotsPreview(
    { spotIds, ...(coords ?? {}) },
    { query: { enabled: spotIds.length > 0, select: (res) => res.data.data ?? null } }
  )
