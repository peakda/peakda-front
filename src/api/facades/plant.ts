import { useQueryClient } from '@tanstack/react-query'
import {
  getList1QueryKey,
  list1,
  search,
  suggest,
  useList1,
  useSearch,
  useSuggest as useSuggestGen,
} from '@/api/facades/generated/plant/plant'
import type { SuggestPlantRequest } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

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

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const usePlants = () =>
  useList1({ query: { select: (res) => res.data.data ?? null } })

export const useSearchPlants = (keyword: string) =>
  useSearch(
    { keyword },
    { query: { enabled: keyword.length > 0, select: (res) => res.data.data ?? null } }
  )

// mutate({ data: payload }) ?뺥깭濡??몄텧
// ?깃났 ???앸Ъ 紐⑸줉 罹먯떆 臾댄슚??
export const useSuggestPlant = () => {
  const queryClient = useQueryClient()
  return useSuggestGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getList1QueryKey() }),
    },
  })
}
