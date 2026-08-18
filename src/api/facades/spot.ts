import {
  getSpotsPreview,
  useGetSpotsPreview,
  usePostSpotsMatch as useMatchGen,
  useGetSpotsById,
} from '@/api/facades/generated/spot/spot'
import type {
  BloomSlotCategory,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'

// 기록 작성에서 카카오 장소를 고르면 그 좌표로 Spot 을 찾거나 만든다.
// 지도 핀 클릭에는 더 이상 쓰지 않는다 — 서버가 노출 명소의 Spot 행을 미리 만들어 준다.
export const useMatchSpot = () => useMatchGen()

// id 가 아직 없으면(선행 조회 대기) 요청하지 않는다.
export const useSpotDetail = (id: number | undefined) =>
  useGetSpotsById(id ?? 0, { query: { enabled: !!id, select: (res) => res.data.data ?? null } })

interface SpotPreviewOptions {
  /** 거리(distanceMeters) 계산 기준 좌표. 없으면 서버가 null 로 준다 */
  coords?: { lat: number; lng: number } | null
  /** 꽃 필터. 고른 꽃 기준으로 뱃지를 계산한다. 비면 각 스팟의 대표 단계 */
  categories?: BloomSlotCategory[]
  /** 시기 필터. 이 상태의 뱃지가 없는 스팟은 결과에서 빠진다 */
  status?: BloomSlotStatus
}

// 이벤트(필터 결과 보기, 핀 클릭 등)에서 프리뷰를 즉시 조회할 때 쓰는 plain async.
// spotIds 가 비면 요청하지 않는다.
export async function spotPreviewApi(spotIds: number[], options: SpotPreviewOptions = {}) {
  if (spotIds.length === 0) return null

  const res = await getSpotsPreview({
    spotIds,
    ...(options.coords ?? {}),
    categories: options.categories?.length ? options.categories : undefined,
    status: options.status,
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
