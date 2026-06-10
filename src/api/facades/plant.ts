import { useQueryClient } from '@tanstack/react-query'
import {
  getList1QueryKey,
  list1,
  search,
  suggest,
  useList1,
  useSearch,
  useSuggest as useSuggestGen,
} from '@/api/generated/plant/plant'
import type { SuggestPlantRequest } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function listPlantsApi() {
  const res = await list1()
  return res.data.data ?? null
}

export async function searchPlantsApi(keyword: string) {
  const res = await search({ keyword })
  return res.data.data ?? null
}

export async function suggestPlantApi(payload: SuggestPlantRequest) {
  const res = await suggest(payload)
  return res.data.data ?? null
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const usePlants = () =>
  useList1({ query: { select: (res) => res.data.data ?? null } })

export const useSearchPlants = (keyword: string) =>
  useSearch(
    { keyword },
    { query: { enabled: keyword.length > 0, select: (res) => res.data.data ?? null } }
  )

// mutate({ data: payload }) 형태로 호출
// 성공 시 식물 목록 캐시 무효화
export const useSuggestPlant = () => {
  const queryClient = useQueryClient()
  return useSuggestGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getList1QueryKey() }),
    },
  })
}
