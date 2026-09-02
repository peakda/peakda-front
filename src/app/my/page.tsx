'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { Nav } from '@/components/ui/layout/Nav'
import { Button } from '@/components/ui/button/Button'
import { ProfileStats } from '@/app/my/_components/ProfileStats'
import { InterestFlowerSection } from '@/app/my/_components/InterestFlowerSection'
import { MyRecordSection } from '@/app/my/_components/MyRecordSection'
import { SavedSpotSection } from '@/app/my/_components/SavedSpotSection'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { useRouter } from 'next/navigation'
import { toMyRecordThumb } from '@/lib/utils/spotRecordToFeed'
import { toProfileStats, toFavoriteFlowerLabels } from '@/lib/utils/userProfile'
import { useMyPage } from '@/api/facades/user'
import { useFavoriteList } from '@/api/facades/spot-favorite'
import { toFavoriteSpotProps } from '@/lib/utils/spotFavorite'
import { useUnreadNotificationCount } from '@/api/facades/notification'
import { formatUnreadBadge } from '@/lib/utils/notificationToAlarm'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'

export default function MyPage() {
  const router = useRouter()
  const { data: myPage } = useMyPage()
  const records = (myPage?.recordPreview ?? []).map(toMyRecordThumb)
  const stats = myPage ? toProfileStats(myPage.stats) : null
  const flowers = myPage ? toFavoriteFlowerLabels(myPage.favoriteCategories) : []
  const { data: unread } = useUnreadNotificationCount()
  const unreadBadge = formatUnreadBadge(unread?.unreadCount ?? 0)
  const { data: favoriteData } = useFavoriteList()
  const savedSpots = (favoriteData?.favorites ?? []).slice(0, 3).map(toFavoriteSpotProps)
  const safeProfileImageUrl = toHttpsImageUrl(myPage?.profileImageUrl)

  return (
    <div className="bg-bg-primary relative flex min-h-screen w-full flex-col pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-text-primary text-xl font-semibold">My</div>}
          right={
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="알림"
                className="relative cursor-pointer"
                onClick={() => router.push('/notification')}
              >
                <Image src="/icons/alram.svg" alt="알림" width={22} height={22} />
                {unreadBadge && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none font-semibold text-white">
                    {unreadBadge}
                  </span>
                )}
              </button>
              <Link href="/my/settings">
                <Settings className="text-icon-secondary h-5.5 w-5.5" strokeWidth={1.8} />
              </Link>
            </div>
          }
        />
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <IconBtn size="md" className="bg-bg-tertiary relative overflow-hidden">
          {safeProfileImageUrl ? (
            <Image
              src={safeProfileImageUrl}
              alt="프로필"
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <Image src="/icons/person.svg" alt="프로필" width={26} height={26} />
          )}
        </IconBtn>
        <span className="text-text-primary flex-1 text-lg font-semibold">
          {myPage?.nickname ?? ''}
        </span>
        <Link href="/profile/edit">
          <Button variant="outlined" size="sm" className="rounded-lg py-3.5">
            프로필 편집
          </Button>
        </Link>
      </div>

      {/* 통계 */}
      <ProfileStats
        recordCount={stats?.recordCount ?? '0'}
        followerCount={stats?.followerCount ?? '0'}
        followingCount={stats?.followingCount ?? '0'}
      />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={flowers} />

      {/* 내 기록 */}
      <MyRecordSection records={records} count={myPage?.stats.recordCount} />

      {/* 저장한 스팟 — 미리보기 3건만 노출하므로 전체 개수는 응답의 count 를 쓴다 */}
      <SavedSpotSection spots={savedSpots} count={favoriteData?.count} />

      <Nav activeTab="my" />
    </div>
  )
}
