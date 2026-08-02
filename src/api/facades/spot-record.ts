import { useQueryClient } from '@tanstack/react-query'
import {
  postSpotsRecords,
  getSpotsRecordsById,
  getGetSpotsRecordsQueryKey,
  getGetSpotsRecordsMeQueryKey,
  getSpotsRecords,
  getSpotsRecordsMe,
  postSpotsRecordsByIdPublish,
  patchSpotsRecordsById,
  postSpotsRecordsPhotos,
  usePostSpotsRecords as useCreateGen,
  useDeleteSpotsRecordsById as useDeleteGen,
  useGetSpotsRecordsById,
  useGetSpotsRecords,
  useGetSpotsRecordsMe,
  usePostSpotsRecordsByIdPublish as usePublishGen,
  usePatchSpotsRecordsById as useUpdateGen,
  usePostSpotsRecordsPhotos as useUploadPhotosGen,
  deleteSpotsRecordsById,
} from '@/api/facades/generated/spot-record/spot-record'
import type {
  CreateSpotRecordRequest,
  GetSpotsRecordsParams,
  GetSpotsRecordsMeParams,
  SpotRecordPhotoUploadForm,
  UpdateSpotRecordRequest,
} from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// 湲곕줉 由ъ뒪??罹먯떆 ??(?ㅽ뙚蹂?/ 蹂몄씤) ??mutation ?깃났 ??臾댄슚?????
const recordListKeys = [['/api/spots/records'], ['/api/spots/records/me']] as const

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function getSpotRecordApi(id: number) {
  const res = await getSpotsRecordsById(id)
  return res.data.data ?? null
}

export async function listSpotRecordsBySpotApi(params: GetSpotsRecordsParams) {
  const res = await getSpotsRecords(params)
  return res.data.data ?? null
}

export async function listMySpotRecordsApi(params: GetSpotsRecordsMeParams) {
  const res = await getSpotsRecordsMe(params)
  return res.data.data ?? null
}

export async function createSpotRecordApi(payload: CreateSpotRecordRequest) {
  const res = await postSpotsRecords(payload)
  return res.data.data ?? null
}

export async function updateSpotRecordApi(id: number, payload: UpdateSpotRecordRequest) {
  const res = await patchSpotsRecordsById(id, payload)
  return res.data.data ?? null
}

export async function publishSpotRecordApi(id: number) {
  const res = await postSpotsRecordsByIdPublish(id)
  return res.data.data ?? null
}

export async function deleteSpotRecordApi(id: number) {
  await deleteSpotsRecordsById(id)
}

export async function uploadSpotRecordPhotosApi(form: SpotRecordPhotoUploadForm) {
  const res = await postSpotsRecordsPhotos(form)
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useSpotRecord = (id: number) =>
  useGetSpotsRecordsById(id, { query: { select: (res) => res.data.data ?? null } })

export const useSpotRecordsBySpot = (params: GetSpotsRecordsParams) =>
  useGetSpotsRecords(params, { query: { select: (res) => res.data.data ?? null } })

export const useMySpotRecords = (params: GetSpotsRecordsMeParams) =>
  useGetSpotsRecordsMe(params, { query: { select: (res) => res.data.data ?? null } })

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
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsMeQueryKey() })
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
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsMeQueryKey() })
        queryClient.invalidateQueries({ queryKey: [`/api/spots/records/${id}`] })
      },
    },
  })
}

export const useDeleteSpotRecord = () => {
  const queryClient = useQueryClient()
  return useDeleteGen({
    mutation: {
      onSuccess: () => {
        recordListKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
        // 게시된 기록이면 피드에도 노출되므로 '/api/feed' 프리픽스 캐시를 함께 무효화한다.
        queryClient.invalidateQueries({
          predicate: (q) =>
            typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/feed'),
        })
      },
    },
  })
}

// mutate({ data: form }) ?뺥깭濡??몄텧
export const useUploadSpotRecordPhotos = () => useUploadPhotosGen()
