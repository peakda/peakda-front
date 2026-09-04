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

// 스팟 상세('/api/spots/{id}')만 고른다. '/api/spots/records...' 나 즐겨찾기 키는 걸리지 않는다.
const SPOT_DETAIL_KEY = /^\/api\/spots\/\d+$/

// 기록이 바뀌면 스팟 상세의 recordPreview(최대 3건)도 낡는다.
// 전역 staleTime 이 5분이라 무효화하지 않으면 그동안 옛 목록이 그대로 보인다.
const invalidateSpotDetail = (queryClient: ReturnType<typeof useQueryClient>, spotId?: number) =>
  queryClient.invalidateQueries(
    spotId != null
      ? { queryKey: [`/api/spots/${spotId}`] }
      : // 삭제는 응답에 스팟 정보가 없어 어느 스팟인지 알 수 없다. 스팟 상세 전체를 턴다.
        { predicate: (q) => typeof q.queryKey[0] === 'string' && SPOT_DETAIL_KEY.test(q.queryKey[0]) }
  )

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

// 기록은 동네형 핀의 원천이라 지도 개화현황도 함께 낡는다. bbox·필터마다 키가 갈리므로
// 프리픽스로 지운다. useBloomMap 의 staleTime 이 30분이라 무효화하지 않으면 내가 쓴 기록이
// 그동안 지도에 안 나타난다.
const invalidateBloomMap = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ['/api/seasonal/blooms'] })

// 기록 변경 mutation — 성공 시 스팟별·본인 기록 리스트 캐시 무효화

export const useCreateSpotRecord = () => {
  const queryClient = useQueryClient()
  return useCreateGen({
    mutation: {
      onSuccess: (res) => {
        recordListKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
        invalidateSpotDetail(queryClient, res.data.data?.spot.id)
        invalidateBloomMap(queryClient)
      },
    },
  })
}

export const useUpdateSpotRecord = () => {
  const queryClient = useQueryClient()
  return useUpdateGen({
    mutation: {
      onSuccess: (res, { id }) => {
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetSpotsRecordsMeQueryKey() })
        queryClient.invalidateQueries({ queryKey: [`/api/spots/records/${id}`] })
        invalidateSpotDetail(queryClient, res.data.data?.spot.id)
        invalidateBloomMap(queryClient)
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
        invalidateSpotDetail(queryClient)
        invalidateBloomMap(queryClient)
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
