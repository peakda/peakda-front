'use client'

import Link from 'next/link'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationListInfinite,
} from '@/api/facades/notification'
import { Alarm } from '@/components/ui/display/Alarm'
import { Button } from '@/components/ui/button/Button'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabItem } from '@/context/TabContext'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { flattenPages } from '@/lib/utils/infinitePages'
import { shouldLoadMore } from '@/lib/utils/myRecords'
import { segmentFromTab, toAlarmItem } from '@/lib/utils/notificationToAlarm'
import { Plus } from 'lucide-react'

const TABS: TabItem[] = [
  { value: 'All', label: '전체' },
  { value: 'Activity', label: '활동' },
  { value: 'Announcement', label: '공지' },
]

const EMPTY_TEXT: Record<string, string> = {
  all: '타이밍 알림은 만개가 가까워지면 알려드려요',
  activity: '다른 사용자를 팔로우하거나\n기록을 남기면 알림이 와요',
  announcement: '서비스 업데이트나\n시즌 안내가 도착하면 알려드려요',
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[calc(100vh-130px)] flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <p className="text-text-primary text-xl font-semibold">아직 알림이 없어요</p>
      <p className="text-text-tertiary text-base whitespace-pre-line">{EMPTY_TEXT[label]}</p>
      {label === 'all' && (
        <Link href="/map">
          <Button
            variant="filled"
            color="primary"
            size="md"
            leftIcon={<Plus className="h-5 w-5" strokeWidth={1.5} />}
            className="rounded-2xl px-6 py-5"
          >
            찜 명소 추가하기
          </Button>
        </Link>
      )}
      {label === 'activity' && (
        <Link href="/record">
          <Button
            variant="filled"
            color="primary"
            size="md"
            leftIcon={<Plus className="h-5 w-5" strokeWidth={1.5} />}
            className="rounded-2xl px-6 py-5"
          >
            기록 남기기
          </Button>
        </Link>
      )}
    </div>
  )
}

function NotificationPanel({ tabValue, label }: { tabValue: string; label: string }) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNotificationListInfinite(segmentFromTab(tabValue))
  const markRead = useMarkNotificationRead()
  // isLoading 은 무한 쿼리에서도 "첫 페이지 로딩 중"만 참이라 빈 상태 판정 기준은 그대로 유효하다.
  // (다음 페이지 로딩은 isFetchingNextPage 로만 나타난다)
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    shouldLoadMore(hasNextPage, isFetchingNextPage)
  )

  if (isLoading) return null

  const notifications = flattenPages(data)
  if (!notifications.length) return <EmptyState label={label} />

  return (
    <div className="px-4">
      {notifications.map((n) => {
        const item = toAlarmItem(n)
        const handleRead = () => {
          if (!n.read) markRead.mutate({ id: n.id })
        }
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={handleRead}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleRead()
            }}
            className="cursor-pointer"
          >
            <Alarm item={item} />
          </div>
        )
      })}
      <div ref={sentinelRef} />
    </div>
  )
}

export function NotificationTabs() {
  const markAll = useMarkAllNotificationsRead()

  return (
    <Tabs tabs={TABS} defaultValue="All">
      <div className="flex justify-end px-4 pt-2">
        <button
          type="button"
          onClick={() => markAll.mutate()}
          className="text-text-tertiary text-sm"
        >
          모두 읽음
        </button>
      </div>
      <TabPanels tabs={TABS}>
        <NotificationPanel tabValue="All" label="all" />
        <NotificationPanel tabValue="Activity" label="activity" />
        <NotificationPanel tabValue="Announcement" label="announcement" />
      </TabPanels>
    </Tabs>
  )
}
