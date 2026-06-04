import Image from 'next/image'
import { MoreHorizontal } from 'lucide-react'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { ProfileStats } from '@/app/my/_components/ProfileStats'
import { InterestFlowerSection } from '@/app/my/_components/InterestFlowerSection'
import { MyRecordSection } from '@/app/my/_components/MyRecordSection'
import { FollowButton } from '@/components/ui/button/FollowButton'

const INTEREST_FLOWERS = ['동백꽃', '매화', '개나리', '벚꽃', '철쭉']

const USER_FEEDS = [
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
]

export default function UserProfilePage() {
  return (
    <div className="bg-bg-primary relative flex min-h-screen w-full flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">Nickname</div>}
          right={<MoreHorizontal className="text-icon-secondary h-5 w-5 cursor-pointer" />}
        />
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <Image src="/icons/person.svg" alt="프로필" width={26} height={26} />
        </div>
        <span className="text-text-primary flex-1 text-lg font-semibold">Nickname</span>
        <FollowButton />
      </div>

      {/* 통계 */}
      <ProfileStats recordCount="24" followerCount="n,nnn" followingCount="nnn" />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={INTEREST_FLOWERS} />

      {/* 내 기록 */}
      <MyRecordSection records={USER_FEEDS} canRecord={false} />
    </div>
  )
}
