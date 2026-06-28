'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import Header from '@/components/ui/layout/Header'
import Nav from '@/components/ui/layout/Nav'
import Button from '@/components/ui/button/Button'
import { SPOTProps } from '@/app/search/_components/SpotPanel'
import { ProfileStats } from '@/app/my/_components/ProfileStats'
import { InterestFlowerSection } from '@/app/my/_components/InterestFlowerSection'
import { MyRecordSection } from '@/app/my/_components/MyRecordSection'
import { SavedSpotSection } from '@/app/my/_components/SavedSpotSection'
import IconBtn from '@/components/ui/button/IconBtn'
import { useRouter } from 'next/navigation'
import { useMySpotRecords } from '@/api/facades/spot-record'
import { toMyRecordThumb } from '@/lib/utils/spotRecordToFeed'
import { useCurrentUser } from '@/api/facades/auth'
import { useFollowSummary } from '@/api/facades/user-follow'
import { useFavoriteList } from '@/api/facades/spot-favorite'

const INTEREST_FLOWERS = ['동백꽃', '매화', '개나리', '벚꽃', '철쭉']

export default function MyPage() {
  const router = useRouter()
  const { data: me } = useCurrentUser()
  const { data: followSummary } = useFollowSummary(me?.id)
  const { data: myRecords } = useMySpotRecords({
    status: 'PUBLISHED',
    pageRequest: { page: 0, size: 6 },
  })
  const records = (myRecords?.content ?? []).map(toMyRecordThumb)
  const { data: favoriteData } = useFavoriteList()
  const savedSpots: SPOTProps[] = (favoriteData?.favorites ?? []).slice(0, 3).map((f) => ({
    id: f.spotId,
    name: f.name,
    location: f.address ?? '',
    status: '',
    nameList: [],
  }))

  return (
    <div className="bg-bg-primary relative flex min-h-screen w-full flex-col pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-text-primary text-xl font-semibold">My</div>}
          right={
            <div className="flex items-center gap-3">
              <Image
                src="/icons/alram.svg"
                alt="알림"
                width={22}
                height={22}
                onClick={() => router.push('/notification')}
              />
              <Link href="/my/settings">
                <Settings className="text-icon-secondary h-5.5 w-5.5" strokeWidth={1.8} />
              </Link>
            </div>
          }
        />
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <IconBtn size="md" className="bg-bg-tertiary">
          <Image src="/icons/person.svg" alt="프로필" width={26} height={26} />
        </IconBtn>
        <span className="text-text-primary flex-1 text-lg font-semibold">{me?.nickname ?? ''}</span>
        <Link href="/profile/edit">
          <Button variant="outlined" size="sm" className="rounded-lg py-3.5">
            프로필 편집
          </Button>
        </Link>
      </div>

      {/* 통계 */}
      <ProfileStats
        recordCount={String(myRecords?.totalElements ?? 0)}
        followerCount={String(followSummary?.followerCount ?? 0)}
        followingCount={String(followSummary?.followingCount ?? 0)}
      />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={INTEREST_FLOWERS} />

      {/* 내 기록 */}
      <MyRecordSection records={records} count={myRecords?.totalElements} />

      {/* 저장한 스팟 */}
      <SavedSpotSection spots={savedSpots} />

      <Nav activeTab="my" />
    </div>
  )
}
