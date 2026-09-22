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
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { useEffect, useState } from 'react'
import { usePlants } from '@/api/facades/plant'
import { readCustomFavoritePlantIds } from '@/lib/utils/customFavoritePlants'

export default function MyPage() {
  const router = useRouter()
  // 비로그인도 이 화면은 볼 수 있다. 하위 화면으로 가는 링크는 LoginGuard 가 바텀시트로 막는다.
  const isLoggedIn = useIsLoggedIn()
  const requireLogin = useRequireLogin()
  const { data: myPage } = useMyPage()
  const { data: plants } = usePlants()
  const [customPlantIds, setCustomPlantIds] = useState<number[]>([])
  useEffect(() => {
    if (myPage) setCustomPlantIds(readCustomFavoritePlantIds(myPage.userId))
  }, [myPage])
  const records = (myPage?.recordPreview ?? []).map(toMyRecordThumb)
  const stats = myPage ? toProfileStats(myPage.stats) : null
  const flowers = myPage
    ? [
        ...toFavoriteFlowerLabels(myPage.favoriteCategories),
        ...(plants ?? []).filter((plant) => customPlantIds.includes(plant.id)).map((plant) => plant.name),
      ]
    : []
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
                onClick={() => requireLogin(() => router.push('/notification'))}
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
        {isLoggedIn ? (
          <>
            <span className="text-text-primary flex-1 text-lg font-semibold">
              {myPage?.nickname ?? ''}
            </span>
            <Link href="/profile/edit">
              <Button variant="outlined" size="sm" className="rounded-lg py-3.5">
                프로필 편집
              </Button>
            </Link>
          </>
        ) : (
          <>
            <span className="text-text-primary flex-1 text-base font-semibold">
              로그인하고 시작해보세요
            </span>
            {/* 비로그인 전용 버튼이라 requireLogin 은 항상 바텀시트를 연다 (로그인 후 /my 로 복귀) */}
            <Button
              variant="filled"
              color="primary"
              size="sm"
              className="rounded-lg py-3.5"
              onClick={() => requireLogin(() => {})}
            >
              로그인
            </Button>
          </>
        )}
      </div>

      {/* 통계 */}
      <ProfileStats
        recordCount={stats?.recordCount ?? '0'}
        followerCount={stats?.followerCount ?? '0'}
        followingCount={stats?.followingCount ?? '0'}
      />

      {/* 관심 식물 */}
      <InterestFlowerSection
        flowers={flowers}
        emptyDescription={isLoggedIn ? undefined : '로그인하고 관심 있는 식물을 등록해보세요'}
      />

      {/* 내 기록 */}
      <MyRecordSection
        records={records}
        count={myPage?.stats.recordCount}
        emptyDescription={isLoggedIn ? undefined : '로그인하고 나의 계절 기록을 남겨보세요'}
      />

      {/* 저장한 스팟 — 미리보기 3건만 노출하므로 전체 개수는 응답의 count 를 쓴다 */}
      <SavedSpotSection spots={savedSpots} count={favoriteData?.count} />

      <Nav activeTab="my" />
    </div>
  )
}
