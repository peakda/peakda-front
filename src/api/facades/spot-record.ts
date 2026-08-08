import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  postSpotsRecords,
  getSpotsRecordsById,
  getGetSpotsRecordsQueryKey,
  getGetSpotsRecordsMeQueryKey,
  getSpotsRecords,
  getSpotsRecordsMe,
  patchSpotsRecordsById,
  postSpotsRecordsPhotos,
  usePostSpotsRecords as useCreateGen,
  useDeleteSpotsRecordsById as useDeleteGen,
  useGetSpotsRecordsById,
  useGetSpotsRecords,
  useGetSpotsRecordsMe,
  usePatchSpotsRecordsById as useUpdateGen,
  usePostSpotsRecordsPhotos as useUploadPhotosGen,
  deleteSpotsRecordsById,
} from '@/api/facades/generated/spot-record/spot-record'
import type {
  CreateSpotRecordRequest,
  GetSpotsRecordsParams,
  GetSpotsRecordsMeParams,
  GetSpotsRecordsMeStatus,
  SpotRecordPhotoUploadForm,
  UpdateSpotRecordRequest,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 기록 리스트 캐시 키 (스팟별 / 본인) — mutation 성공 시 무효화한다.
const recordListKeys = [['/api/spots/records'], ['/api/spots/records/me']] as const

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

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

export async function deleteSpotRecordApi(id: number) {
  await deleteSpotsRecordsById(id)
}

export async function uploadSpotRecordPhotosApi(form: SpotRecordPhotoUploadForm) {
  const res = await postSpotsRecordsPhotos(form)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useSpotRecord = (id: number) =>
  useGetSpotsRecordsById(id, { query: { select: (res) => res.data.data ?? null } })

export const useSpotRecordsBySpot = (params: GetSpotsRecordsParams) =>
  useGetSpotsRecords(params, { query: { select: (res) => res.data.data ?? null } })

export const useMySpotRecords = (params: GetSpotsRecordsMeParams) =>
  useGetSpotsRecordsMe(params, { query: { select: (res) => res.data.data ?? null } })

// 무한 스크롤용. 키 프리픽스를 recordListKeys 와 맞춰 mutation 무효화에 함께 걸리게 한다.

export const useSpotRecordsBySpotInfinite = (spotId: number) =>
  useInfiniteQuery({
    queryKey: ['/api/spots/records', 'infinite', spotId],
    queryFn: ({ pageParam }) =>
      listSpotRecordsBySpotApi({ spotId, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
  })

export const useMySpotRecordsInfinite = (status: GetSpotsRecordsMeStatus) =>
  useInfiniteQuery({
    queryKey: ['/api/spots/records/me', 'infinite', status],
    queryFn: ({ pageParam }) =>
      listMySpotRecordsApi({ status, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
  })

// 기록 변경 mutation — 성공 시 스팟별·본인 기록 리스트 캐시 무효화

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

// mutate({ data: form }) 형태로 호출
export const useUploadSpotRecordPhotos = () => useUploadPhotosGen()
