'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { ProfileStats } from '@/app/my/_components/ProfileStats'
import { InterestFlowerSection } from '@/app/my/_components/InterestFlowerSection'
import { MyRecordSection } from '@/app/my/_components/MyRecordSection'
import { FollowButton } from '@/components/ui/button/FollowButton'
import { useFollowSummary } from '@/api/facades/user-follow'

// 목업: 타 유저의 닉네임/프로필이미지/기록/관심식물 조회 API가 없어 유지한다.
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
  const params = useParams<{ id: string }>()
  const userId = Number(params.id)
  const { data: summary } = useFollowSummary(userId)

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
        {summary && <FollowButton userId={userId} initialFollowing={summary.following} />}
      </div>

      {/* 통계 — 팔로워/팔로잉 수는 실데이터, 기록 수는 API 부재로 목업 */}
      <ProfileStats
        recordCount="24"
        followerCount={String(summary?.followerCount ?? 0)}
        followingCount={String(summary?.followingCount ?? 0)}
      />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={INTEREST_FLOWERS} />

      {/* 내 기록 */}
      <MyRecordSection records={USER_FEEDS} canRecord={false} />
    </div>
  )
}
