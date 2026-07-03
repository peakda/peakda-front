import {
  match,
  preview,
  usePreview,
  useMatch as useMatchGen,
  useGetSpotDetail,
} from '@/api/facades/generated/spot/spot'
import type { SpotMatchRequest } from '@/api/facades/generated/peakdaApi.schemas'

export async function matchSpotApi(payload: SpotMatchRequest) {
  const res = await match(payload)
  return res.data.data ?? null
}

export const useMatchSpot = () => useMatchGen()

export const useSpotDetail = (id: number) =>
  useGetSpotDetail(id, { query: { select: (res) => res.data.data ?? null } })

// 이벤트(핀 클릭 등)에서 프리뷰를 즉시 조회할 때 사용하는 plain async.
// spotIds 가 비면 요청하지 않는다.
export async function spotPreviewApi(spotIds: number[], coords?: { lat: number; lng: number }) {
  if (spotIds.length === 0) return null
  const res = await preview({ spotIds, ...(coords ?? {}) })
  return res.data.data ?? null
}

// 스팟 id 목록으로 프리뷰 카드(썸네일·거리·뱃지) 조회. coords 전달 시 거리 계산.
// spotIds 가 비면 요청하지 않는다.
export const useSpotPreview = (spotIds: number[], coords?: { lat: number; lng: number }) =>
  usePreview(
    { spotIds, ...(coords ?? {}) },
    { query: { enabled: spotIds.length > 0, select: (res) => res.data.data ?? null } }
  )
