'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { ProfileStats } from '@/app/my/_components/ProfileStats'
import { InterestFlowerSection } from '@/app/my/_components/InterestFlowerSection'
import { MyRecordSection } from '@/app/my/_components/MyRecordSection'
import { FollowButton } from '@/components/ui/button/FollowButton'
import { useUserProfile } from '@/api/facades/user-profile'
import { useBlockUser, useUnblockUser } from '@/api/facades/user-block'
import { toProfileStats, toFavoriteFlowerLabels } from '@/lib/utils/userProfile'
import { toMyRecordThumb } from '@/lib/utils/spotRecordToFeed'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'

export default function UserProfilePage() {
  const params = useParams<{ id: string }>()
  const userId = Number(params.id)
  const { data: profile } = useUserProfile(userId)

  const [menuOpen, setMenuOpen] = useState(false)
  // 차단 여부는 프로필 응답(blocked)을 따르고, 이 화면에서 차단/해제한 뒤에만 로컬 값으로 덮어쓴다.
  // (useState 초기값으로 두면 나중에 도착한 프로필의 blocked 가 반영되지 않는다)
  const [blockedOverride, setBlockedOverride] = useState<boolean | null>(null)
  const blocked = blockedOverride ?? profile?.blocked ?? false
  const blockMutation = useBlockUser()
  const unblockMutation = useUnblockUser()

  const handleToggleBlock = () => {
    setMenuOpen(false)
    if (blocked) {
      unblockMutation.mutate({ userId }, { onSuccess: () => setBlockedOverride(false) })
    } else {
      blockMutation.mutate({ userId }, { onSuccess: () => setBlockedOverride(true) })
    }
  }

  const stats = profile ? toProfileStats(profile.stats) : null
  const flowers = profile ? toFavoriteFlowerLabels(profile.favoriteCategories) : []
  const records = (profile?.recordPreview ?? []).map(toMyRecordThumb)
  const safeProfileImageUrl = toHttpsImageUrl(profile?.profileImageUrl)

  return (
    <div className="bg-bg-primary relative flex min-h-screen w-full flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={
            <div className="text-[15px] font-medium text-[#000000]">{profile?.nickname ?? ''}</div>
          }
          right={
            <div className="relative">
              <MoreHorizontal
                className="text-icon-secondary h-5 w-5 cursor-pointer"
                onClick={() => setMenuOpen((v) => !v)}
              />
              {menuOpen && (
                <div className="absolute top-7 right-0 z-50 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                  <button
                    type="button"
                    onClick={handleToggleBlock}
                    className="w-full px-4 py-3 text-left text-sm text-rose-500"
                  >
                    {blocked ? '차단 해제' : '차단하기'}
                  </button>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {safeProfileImageUrl ? (
            <Image
              src={safeProfileImageUrl}
              alt="프로필"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image src="/icons/person.svg" alt="프로필" width={26} height={26} />
          )}
        </div>
        <span className="text-text-primary flex-1 text-lg font-semibold">
          {profile?.nickname ?? ''}
        </span>
        {profile && <FollowButton userId={userId} initialFollowing={profile.following} />}
      </div>

      {/* 통계 */}
      <ProfileStats
        recordCount={stats?.recordCount ?? '0'}
        followerCount={stats?.followerCount ?? '0'}
        followingCount={stats?.followingCount ?? '0'}
        userId={userId}
      />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={flowers} action="" />

      {/* 내 기록 */}
      <MyRecordSection records={records} count={profile?.stats.recordCount} canRecord={false} />
    </div>
  )
}
