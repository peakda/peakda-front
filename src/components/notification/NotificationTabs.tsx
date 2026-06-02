'use client'

import { Alarm, AlarmItemData } from '@/components/ui/display/Alarm'
import Button from '@/components/ui/button/Button'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabItem } from '@/context/TabContext'
import { Plus } from 'lucide-react'

const TABS: TabItem[] = [
  { value: 'All', label: '전체' },
  { value: 'Activity', label: '활동' },
  { value: 'Announcement', label: '공지' },
]

const activityAlarms: AlarmItemData[] = [
  {
    id: '1',
    type: 'timing',
    isRead: false,
    title: '진해 군항제 벚꽃 절정 임박',
    description: '현재 70% 개화 상태입니다. 절정까지 약 2일 남았어요.',
    timestamp: '10분 전',
  },
  {
    id: '2',
    type: 'timing',
    isRead: true,
    title: '경주 불국사 단풍 절정',
    description: '지금이 딱 좋은 시기예요! 주말 방문을 추천드려요.',
    timestamp: '2시간 전',
  },
  {
    id: '3',
    type: 'following',
    isRead: false,
    title: '봄날여행자님이 팔로우했습니다',
    timestamp: '1일 전',
    onFollowBack: () => {},
  },
  {
    id: '4',
    type: 'following',
    isRead: true,
    title: '꽃구경러버님이 팔로우했습니다',
    timestamp: '3일 전',
    onFollowBack: () => {},
  },
]

const announcementAlarms: AlarmItemData[] = [
  {
    id: '5',
    type: 'notice',
    isRead: false,
    title: '앱 업데이트 안내',
    description: '새로운 기능이 추가되었습니다. 업데이트 후 이용해 주세요.',
    timestamp: '5시간 전',
  },
  {
    id: '6',
    type: 'notice',
    isRead: true,
    title: '서비스 점검 안내',
    description: '5월 27일 새벽 2시~4시 서비스 점검이 예정되어 있습니다.',
    timestamp: '1일 전',
  },
  {
    id: '7',
    type: 'reaction',
    isRead: false,
    title: '여행러님이 내 게시물에 반응했습니다',
    reactionEmoji: '🌸',
    timestamp: '30분 전',
  },
  {
    id: '8',
    type: 'reaction',
    isRead: true,
    title: '자연인님이 내 게시물에 반응했습니다',
    reactionEmoji: '🍁',
    timestamp: '2일 전',
  },
]

const allAlarms: AlarmItemData[] = [...activityAlarms, ...announcementAlarms].sort((a, b) =>
  a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1
)

const EMPTY_TEXT: Record<string, string> = {
  all: '타이밍 알림은 만개가 가까워지면 알려드려요',
  activity: '다른 사용자를 팔로우하거나\n기록을 남기면 알림이 와요',
  announcement: '서비스 업데이트나\n시즌 안내가 도착하면 알려드려요',
}

function AlarmList({ items, label }: { items: AlarmItemData[]; label: string }) {
  if (items.length) {
    return (
      <div className="flex h-[calc(100vh-130px)] flex-col items-center justify-center gap-2 px-4 py-12 text-center">
        <p className="text-text-primary text-xl font-semibold">아직 알림이 없어요</p>
        <p className="text-text-tertiary text-base whitespace-pre-line">{EMPTY_TEXT[label]}</p>
        {label === 'all' && (
          <Button
            variant="filled"
            color="primary"
            size="md"
            leftIcon={<Plus className="h-5 w-5" strokeWidth={1.5} />}
            className="rounded-2xl px-6 py-5"
          >
            찜 명소 추가하기
          </Button>
        )}
        {label === 'activity' && (
          <Button
            variant="filled"
            color="primary"
            size="md"
            leftIcon={<Plus className="h-5 w-5" strokeWidth={1.5} />}
            className="rounded-2xl px-6 py-5"
          >
            기록 남기기
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="px-4">
      {items.map((item) => (
        <Alarm key={item.id} item={item} />
      ))}
    </div>
  )
}

export function NotificationTabs() {
  return (
    <Tabs tabs={TABS} defaultValue="All">
      <TabPanels tabs={TABS}>
        <AlarmList items={allAlarms} label="all" />
        <AlarmList items={activityAlarms} label="activity" />
        <AlarmList items={announcementAlarms} label="announcement" />
      </TabPanels>
    </Tabs>
  )
}
