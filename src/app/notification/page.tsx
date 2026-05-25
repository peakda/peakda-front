import LeftArrow from '@/components/ui/button/LeftArrow'
import Header from '@/components/ui/layout/Header'
import { NotificationTabs } from '@/components/notification/NotificationTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '알림',
  description: '알림을 통해 활동과 공지를 확인하세요.',
}

export default function NotificationPage() {
  return (
    <div>
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">알림</div>}
        />
      </div>

      <NotificationTabs />
    </div>
  )
}
