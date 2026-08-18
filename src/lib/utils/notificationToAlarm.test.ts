import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NotificationResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { GetNotificationsSegment } from '@/api/facades/generated/peakdaApi.schemas'
import {
  formatUnreadBadge,
  segmentFromTab,
  toAlarmItem,
  toNotificationHref,
} from './notificationToAlarm'

const baseNotification = (over: Partial<NotificationResponse> = {}): NotificationResponse => ({
  id: 1,
  type: 'TIMING',
  title: '진해 군항제 벚꽃 절정 임박',
  body: '현재 70% 개화 상태입니다.',
  linkType: 'INTERNAL',
  read: false,
  createdAt: '2026-07-22T00:00:00.000Z',
  ...over,
})

describe('toAlarmItem', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-22T00:10:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('기본 필드를 매핑한다', () => {
    const item = toAlarmItem(baseNotification({ id: 42 }))
    expect(item.id).toBe('42')
    expect(item.type).toBe('timing')
    expect(item.isRead).toBe(false)
    expect(item.title).toBe('진해 군항제 벚꽃 절정 임박')
    expect(item.description).toBe('현재 70% 개화 상태입니다.')
    expect(item.timestamp).toBe('10분 전')
  })

  it('type 을 Alarm UI 타입으로 매핑한다', () => {
    expect(toAlarmItem(baseNotification({ type: 'TIMING' })).type).toBe('timing')
    expect(toAlarmItem(baseNotification({ type: 'FOLLOW' })).type).toBe('following')
    expect(toAlarmItem(baseNotification({ type: 'REACTION' })).type).toBe('reaction')
    expect(toAlarmItem(baseNotification({ type: 'NOTICE' })).type).toBe('notice')
  })

  it('read 를 isRead 로 매핑한다', () => {
    expect(toAlarmItem(baseNotification({ read: true })).isRead).toBe(true)
  })

  it('body 가 비어 있으면 description 을 undefined 로 둔다', () => {
    expect(toAlarmItem(baseNotification({ body: '' })).description).toBeUndefined()
  })

  it('imageUrl 을 그대로 넘기고, 없으면 undefined 로 둔다', () => {
    expect(toAlarmItem(baseNotification({ imageUrl: 'https://cdn.test/a.png' })).imageUrl).toBe(
      'https://cdn.test/a.png'
    )
    expect(toAlarmItem(baseNotification({ imageUrl: null })).imageUrl).toBeUndefined()
    expect(toAlarmItem(baseNotification()).imageUrl).toBeUndefined()
  })

  it('createdAt 을 상대 시간으로 포맷한다', () => {
    vi.setSystemTime(new Date('2026-07-22T00:00:30.000Z'))
    expect(toAlarmItem(baseNotification()).timestamp).toBe('방금 전')
    vi.setSystemTime(new Date('2026-07-22T02:00:00.000Z'))
    expect(toAlarmItem(baseNotification()).timestamp).toBe('2시간 전')
    vi.setSystemTime(new Date('2026-07-24T00:00:00.000Z'))
    expect(toAlarmItem(baseNotification()).timestamp).toBe('2일 전')
    vi.setSystemTime(new Date('2026-08-01T00:00:00.000Z'))
    expect(toAlarmItem(baseNotification()).timestamp).toBe('2026.07.22')
  })
})

describe('toNotificationHref', () => {
  it('TIMING 은 targetId 를 spotId 로 보고 /spot 으로 보낸다', () => {
    expect(toNotificationHref(baseNotification({ type: 'TIMING', targetId: 7 }))).toEqual({
      href: '/spot/7',
      isExternal: false,
    })
  })

  it('FOLLOW 는 targetId 를 userId 로 보고 /users 로 보낸다', () => {
    expect(toNotificationHref(baseNotification({ type: 'FOLLOW', targetId: 12 }))).toEqual({
      href: '/users/12',
      isExternal: false,
    })
  })

  it('REACTION 은 targetId 를 recordId 로 보고 /feed 로 보낸다', () => {
    expect(toNotificationHref(baseNotification({ type: 'REACTION', targetId: 30 }))).toEqual({
      href: '/feed/30',
      isExternal: false,
    })
  })

  it('NOTICE + EXTERNAL 은 linkUrl 을 외부 링크로 반환한다', () => {
    expect(
      toNotificationHref(
        baseNotification({
          type: 'NOTICE',
          linkType: 'EXTERNAL',
          linkUrl: 'https://peakda.example/notice/1',
        })
      )
    ).toEqual({ href: 'https://peakda.example/notice/1', isExternal: true })
  })

  it('NOTICE + INTERNAL 은 조합할 내부 경로가 없어 이동하지 않는다', () => {
    expect(
      toNotificationHref(baseNotification({ type: 'NOTICE', linkType: 'INTERNAL', targetId: 3 }))
    ).toBeNull()
  })

  it('INTERNAL 인데 targetId 가 없으면 이동하지 않는다', () => {
    expect(toNotificationHref(baseNotification({ type: 'TIMING', targetId: null }))).toBeNull()
    expect(toNotificationHref(baseNotification({ type: 'FOLLOW' }))).toBeNull()
  })

  it('INTERNAL 은 linkUrl 이 있어도 무시하고 type + targetId 로 조합한다', () => {
    expect(
      toNotificationHref(
        baseNotification({ type: 'REACTION', targetId: 5, linkUrl: 'https://ignored.example' })
      )
    ).toEqual({ href: '/feed/5', isExternal: false })
  })

  it('EXTERNAL 인데 linkUrl 이 없거나 http(s) 가 아니면 이동하지 않는다', () => {
    expect(toNotificationHref(baseNotification({ linkType: 'EXTERNAL' }))).toBeNull()
    expect(toNotificationHref(baseNotification({ linkType: 'EXTERNAL', linkUrl: '' }))).toBeNull()
    expect(
      toNotificationHref(baseNotification({ linkType: 'EXTERNAL', linkUrl: 'javascript:alert(1)' }))
    ).toBeNull()
  })
})

describe('segmentFromTab', () => {
  it('탭 value 를 세그먼트로 매핑한다', () => {
    expect(segmentFromTab('All')).toBe(GetNotificationsSegment.ALL)
    expect(segmentFromTab('Activity')).toBe(GetNotificationsSegment.ACTIVITY)
    expect(segmentFromTab('Announcement')).toBe(GetNotificationsSegment.NOTICE)
  })

  it('알 수 없는 값은 ALL 로 폴백한다', () => {
    expect(segmentFromTab('unknown')).toBe(GetNotificationsSegment.ALL)
  })
})

describe('formatUnreadBadge', () => {
  it('0 이하면 null(뱃지 숨김) 을 반환한다', () => {
    expect(formatUnreadBadge(0)).toBeNull()
    expect(formatUnreadBadge(-1)).toBeNull()
  })

  it('1~99 는 숫자 문자열을 반환한다', () => {
    expect(formatUnreadBadge(1)).toBe('1')
    expect(formatUnreadBadge(99)).toBe('99')
  })

  it('99 초과는 99+ 로 표기한다', () => {
    expect(formatUnreadBadge(100)).toBe('99+')
    expect(formatUnreadBadge(1000)).toBe('99+')
  })
})
