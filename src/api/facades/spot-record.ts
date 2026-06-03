import { useQueryClient } from '@tanstack/react-query'
import {
  create,
  get,
  getListBySpotQueryKey,
  getListMineQueryKey,
  listBySpot,
  listMine,
  publish,
  update,
  uploadPhotos,
  useCreate as useCreateGen,
  useDelete as useDeleteGen,
  useGet,
  useListBySpot,
  useListMine,
  usePublish as usePublishGen,
  useUpdate as useUpdateGen,
  useUploadPhotos as useUploadPhotosGen,
  _delete,
} from '@/api/generated/spot-record/spot-record'
import type {
  CreateSpotRecordRequest,
  ListBySpotParams,
  ListMineParams,
  SpotRecordPhotoUploadForm,
  UpdateSpotRecordRequest,
} from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 기록 리스트 캐시 키 (스팟별 / 본인) — mutation 성공 시 무효화 대상
const recordListKeys = [['/api/spots/records'], ['/api/spots/records/me']] as const

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function getSpotRecordApi(id: number) {
  const res = await get(id)
  return res.data.data ?? null
}

export async function listSpotRecordsBySpotApi(params: ListBySpotParams) {
  const res = await listBySpot(params)
  return res.data.data ?? null
}

export async function listMySpotRecordsApi(params: ListMineParams) {
  const res = await listMine(params)
  return res.data.data ?? null
}

export async function createSpotRecordApi(payload: CreateSpotRecordRequest) {
  const res = await create(payload)
  return res.data.data ?? null
}

export async function updateSpotRecordApi(id: number, payload: UpdateSpotRecordRequest) {
  const res = await update(id, payload)
  return res.data.data ?? null
}

export async function publishSpotRecordApi(id: number) {
  const res = await publish(id)
  return res.data.data ?? null
}

export async function deleteSpotRecordApi(id: number) {
  await _delete(id)
}

export async function uploadSpotRecordPhotosApi(form: SpotRecordPhotoUploadForm) {
  const res = await uploadPhotos(form)
  return res.data.data ?? null
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const useSpotRecord = (id: number) =>
  useGet(id, { query: { select: (res) => res.data.data ?? null } })

export const useSpotRecordsBySpot = (params: ListBySpotParams) =>
  useListBySpot(params, { query: { select: (res) => res.data.data ?? null } })

export const useMySpotRecords = (params: ListMineParams) =>
  useListMine(params, { query: { select: (res) => res.data.data ?? null } })

// 기록 변경 mutation — 성공 시 스팟별/본인 기록 리스트 캐시 무효화

export const useCreateSpotRecord = () => {
  const queryClient = useQueryClient()
  return useCreateGen({
    mutation: {
      onSuccess: () =>
        recordListKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey })),
    },
  })
}

export const useUpdateSpotRecord = () => {
  const queryClient = useQueryClient()
  return useUpdateGen({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: getListBySpotQueryKey() })
        queryClient.invalidateQueries({ queryKey: getListMineQueryKey() })
        queryClient.invalidateQueries({ queryKey: [`/api/spots/records/${id}`] })
      },
    },
  })
}

export const usePublishSpotRecord = () => {
  const queryClient = useQueryClient()
  return usePublishGen({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: getListBySpotQueryKey() })
        queryClient.invalidateQueries({ queryKey: getListMineQueryKey() })
        queryClient.invalidateQueries({ queryKey: [`/api/spots/records/${id}`] })
      },
    },
  })
}

export const useDeleteSpotRecord = () => {
  const queryClient = useQueryClient()
  return useDeleteGen({
    mutation: {
      onSuccess: () =>
        recordListKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey })),
    },
  })
}

// mutate({ data: form }) 형태로 호출
export const useUploadSpotRecordPhotos = () => useUploadPhotosGen()
