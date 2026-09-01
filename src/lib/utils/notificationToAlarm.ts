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
    imageUrl: n.imageUrl || undefined,
    timestamp: formatTimeAgo(n.createdAt),
  }
}

export interface NotificationLink {
  href: string
  isExternal: boolean
}

// INTERNAL 알림의 type → 경로 prefix. targetId 를 뒤에 붙인다.
// NOTICE 는 관리자가 지정하는 값이라 프론트가 조합할 내부 경로가 없다 → null(이동 없음).
const INTERNAL_PREFIX: Record<NotificationResponse['type'], string | null> = {
  TIMING: '/spot',
  FOLLOW: '/users',
  REACTION: '/feed',
  NOTICE: null,
}

type NotificationLinkSource = Pick<NotificationResponse, 'type' | 'linkType' | 'targetId' | 'linkUrl'>

// 알림 탭 시 이동할 링크. 이동할 수 없으면 null(읽음 처리만 한다).
export function toNotificationHref(n: NotificationLinkSource): NotificationLink | null {
  if (n.linkType === 'EXTERNAL') {
    // http(s) 만 허용 — javascript: 같은 스킴이 내려와도 열지 않는다.
    if (!n.linkUrl || !/^https?:\/\//i.test(n.linkUrl)) return null
    return { href: n.linkUrl, isExternal: true }
  }

  const prefix = INTERNAL_PREFIX[n.type]
  if (!prefix || n.targetId == null) return null
  return { href: `${prefix}/${n.targetId}`, isExternal: false }
}

function isNotificationType(v: unknown): v is NotificationResponse['type'] {
  return typeof v === 'string' && v in TYPE_MAP
}

function isLinkType(v: unknown): v is NotificationResponse['linkType'] {
  return v === 'INTERNAL' || v === 'EXTERNAL'
}

function parseIntField(value: unknown): number | null {
  if (typeof value !== 'string' || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export interface PushNotificationTarget {
  notificationId: number | null
  link: NotificationLink | null
}

// FCM data 페이로드는 값이 전부 문자열이다 (백엔드 규격: notificationId, type, linkType, targetId, linkUrl).
// GET /api/notifications 응답과 같은 필드 세트라 toNotificationHref 를 그대로 재사용한다.
export function resolvePushNotificationTarget(data: unknown): PushNotificationTarget {
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
  const notificationId = parseIntField(record.notificationId)
  const { type, linkType, linkUrl } = record

  if (!isNotificationType(type) || !isLinkType(linkType)) {
    return { notificationId, link: null }
  }

  const link = toNotificationHref({
    type,
    linkType,
    targetId: parseIntField(record.targetId),
    linkUrl: typeof linkUrl === 'string' ? linkUrl : null,
  })

  return { notificationId, link }
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
