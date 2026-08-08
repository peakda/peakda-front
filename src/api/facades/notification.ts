import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  patchNotificationsReadAll,
  patchNotificationsByIdRead,
  getNotificationsUnreadCount,
  useGetNotifications,
  usePatchNotificationsReadAll as useMarkAllReadGen,
  usePatchNotificationsByIdRead as useMarkReadGen,
  useGetNotificationsUnreadCount,
} from '@/api/facades/generated/notification/notification'
import type {
  GetNotificationsParams,
  GetNotificationsSegment as NotificationSegment,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 읽음 처리 시 목록·안읽은 개수 모두 무효화 → '/api/notifications' 프리픽스로 일괄 처리
const invalidateNotifications = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) =>
      typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/notifications'),
  })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function notificationListApi(params: GetNotificationsParams) {
  const res = await getNotifications(params)
  return res.data.data ?? null
}

export async function unreadCountApi() {
  const res = await getNotificationsUnreadCount()
  return res.data.data ?? null
}

export async function markNotificationReadApi(id: number) {
  await patchNotificationsByIdRead(id)
}

export async function markAllNotificationsReadApi() {
  await patchNotificationsReadAll()
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useNotificationList = (params: GetNotificationsParams) =>
  useGetNotifications(params, { query: { select: (res) => res.data.data ?? null } })

// 무한 스크롤용. 읽음 처리 시 '/api/notifications' 프리픽스 무효화에 함께 걸린다.
export const useNotificationListInfinite = (segment: NotificationSegment) =>
  useInfiniteQuery({
    queryKey: ['/api/notifications', 'infinite', segment],
    queryFn: ({ pageParam }) =>
      notificationListApi({ segment, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    // 다른 사용자의 행동으로 바뀌는 값이라 전역 5분을 따르지 않는다 (CLAUDE.md API 호출 규칙)
    staleTime: 0,
  })

export const useUnreadNotificationCount = () =>
  useGetNotificationsUnreadCount({ query: { select: (res) => res.data.data ?? null } })

// mutate({ id }) 형태로 호출 → 성공 시 알림 캐시 무효화
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMarkReadGen({ mutation: { onSuccess: () => invalidateNotifications(queryClient) } })
}

// mutate() 형태로 호출 → 성공 시 알림 캐시 무효화
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMarkAllReadGen({ mutation: { onSuccess: () => invalidateNotifications(queryClient) } })
}
