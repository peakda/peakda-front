import { useQueryClient } from '@tanstack/react-query'
import {
  list3,
  markAllRead,
  markRead,
  unreadCount,
  useList3,
  useMarkAllRead as useMarkAllReadGen,
  useMarkRead as useMarkReadGen,
  useUnreadCount,
} from '@/api/facades/generated/notification/notification'
import type { List3Params } from '@/api/facades/generated/peakdaApi.schemas'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 읽음 처리 시 목록·안읽은 개수 모두 무효화 → '/api/notifications' 프리픽스로 일괄 처리
const invalidateNotifications = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (q) =>
      typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/notifications'),
  })

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function notificationListApi(params: List3Params) {
  const res = await list3(params)
  return res.data.data ?? null
}

export async function unreadCountApi() {
  const res = await unreadCount()
  return res.data.data ?? null
}

export async function markNotificationReadApi(id: number) {
  await markRead(id)
}

export async function markAllNotificationsReadApi() {
  await markAllRead()
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useNotificationList = (params: List3Params) =>
  useList3(params, { query: { select: (res) => res.data.data ?? null } })

export const useUnreadNotificationCount = () =>
  useUnreadCount({ query: { select: (res) => res.data.data ?? null } })

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
