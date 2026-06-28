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
} from '@/api/facades/generated/spot-record/spot-record'
import type {
  CreateSpotRecordRequest,
  ListBySpotParams,
  ListMineParams,
  SpotRecordPhotoUploadForm,
  UpdateSpotRecordRequest,
} from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// 湲곕줉 由ъ뒪??罹먯떆 ??(?ㅽ뙚蹂?/ 蹂몄씤) ??mutation ?깃났 ??臾댄슚?????
const recordListKeys = [['/api/spots/records'], ['/api/spots/records/me']] as const

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

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

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useSpotRecord = (id: number) =>
  useGet(id, { query: { select: (res) => res.data.data ?? null } })

export const useSpotRecordsBySpot = (params: ListBySpotParams) =>
  useListBySpot(params, { query: { select: (res) => res.data.data ?? null } })

export const useMySpotRecords = (params: ListMineParams) =>
  useListMine(params, { query: { select: (res) => res.data.data ?? null } })

// 湲곕줉 蹂寃?mutation ???깃났 ???ㅽ뙚蹂?蹂몄씤 湲곕줉 由ъ뒪??罹먯떆 臾댄슚??

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

// mutate({ data: form }) ?뺥깭濡??몄텧
export const useUploadSpotRecordPhotos = () => useUploadPhotosGen()
