import { match, useMatch as useMatchGen, useGetSpotDetail } from '@/api/facades/generated/spot/spot'
import type { SpotMatchRequest } from '@/api/facades/generated/peakdaApi.schemas'

export async function matchSpotApi(payload: SpotMatchRequest) {
  const res = await match(payload)
  return res.data.data ?? null
}

export const useMatchSpot = () =>
  useMatchGen({ mutation: { select: (res) => res.data.data ?? null } })

export const useSpotDetail = (id: number) =>
  useGetSpotDetail(id, { query: { select: (res) => res.data.data ?? null } })
