import type {
  GetNotificationsSegment as List3SegmentType,
  NotificationResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { GetNotificationsSegment } from '@/api/facades/generated/peakdaApi.schemas'
import type { AlarmItemData, AlarmType } from '@/components/ui/display/Alarm'

// NotificationResponse.type → Alarm UI type
const TYPE_MAP: Record<NotificationResponse['type'], AlarmType> = {
  TIMING: 'timing',
  FOLLOW: 'following',
  REACTION: 'reaction',
  NOTICE: 'notice',
}

// ISO 문자열 → 'YYYY.MM.DD'
const toDot = (iso: string) => iso.slice(0, 10).replaceAll('-', '.')

// 생성 시각 → 상대 시간 (7일 이상은 날짜로 표기)
// spotRecordToFeed.ts 의 동일 로직을 복제 (해당 파일은 타 에이전트가 수정 중이라 import 대신 복제)
function formatTimeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return toDot(iso)
}

// NotificationResponse → Alarm UI 데이터
export function toAlarmItem(n: NotificationResponse): AlarmItemData {
  return {
    id: String(n.id),
    type: TYPE_MAP[n.type],
    isRead: n.read,
    title: n.title,
    description: n.body || undefined,
    timestamp: formatTimeAgo(n.createdAt),
  }
}

// 탭 value → 알림 세그먼트
const SEGMENT_MAP: Record<string, List3SegmentType> = {
  All: GetNotificationsSegment.ALL,
  Activity: GetNotificationsSegment.ACTIVITY,
  Announcement: GetNotificationsSegment.NOTICE,
}

export function segmentFromTab(tabValue: string): List3SegmentType {
  return SEGMENT_MAP[tabValue] ?? GetNotificationsSegment.ALL
}

// 안 읽은 알림 개수 → 뱃지 라벨. 0 이하는 null(뱃지 숨김), 99 초과는 '99+'.
export function formatUnreadBadge(count: number): string | null {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}
