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
import type {
  BloomSlotCategory,
  SpotMatchRequest,
} from '@/api/facades/generated/peakdaApi.schemas'

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

interface SpotPreviewOptions {
  /** 거리(distanceMeters) 계산 기준 좌표. 없으면 서버가 null 로 준다 */
  coords?: { lat: number; lng: number } | null
  /** 꽃 필터가 걸려 있으면 그 꽃 기준으로 뱃지를 계산한다. 생략 시 각 스팟의 대표 단계 */
  category?: BloomSlotCategory | null
}

// 이벤트(필터 결과 보기, 핀 클릭 등)에서 프리뷰를 즉시 조회할 때 쓰는 plain async.
// spotIds 가 비면 요청하지 않는다.
export async function spotPreviewApi(spotIds: number[], options: SpotPreviewOptions = {}) {
  if (spotIds.length === 0) return null

  const res = await getSpotsPreview({
    spotIds,
    ...(options.coords ?? {}),
    category: options.category ?? undefined,
  })
  return res.data.data ?? null
}

// 스팟 id 목록으로 프리뷰 카드(썸네일·거리·뱃지) 조회. coords 전달 시 거리 계산.
// spotIds 가 비면 요청하지 않는다.
export const useSpotPreview = (spotIds: number[], coords?: { lat: number; lng: number }) =>
  useGetSpotsPreview(
    { spotIds, ...(coords ?? {}) },
    { query: { enabled: spotIds.length > 0, select: (res) => res.data.data ?? null } }
  )
