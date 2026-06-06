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

const INTEREST_FLOWERS = ['동백꽃', '매화', '개나리', '벚꽃', '철쭉']

const MY_FEEDS = [
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
  { image: '/images/explore.png', date: 'yy.mm.dd', isPopular: true },
]

const SAVED_SPOTS: SPOTProps[] = [
  {
    id: 1,
    name: '경주 벚꽃축제',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
  {
    id: 2,
    name: '서울숲 벚꽃길',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
  {
    id: 3,
    name: '여의도 한강공원 벚꽃길',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
]

export default function MyPage() {
  const router = useRouter()
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
        <span className="text-text-primary flex-1 text-lg font-semibold">Nickname</span>
        <Link href="/profile/edit">
          <Button variant="outlined" size="sm" className="rounded-lg py-3.5">
            프로필 편집
          </Button>
        </Link>
      </div>

      {/* 통계 */}
      <ProfileStats recordCount="24" followerCount="n,nnn" followingCount="nnn" />

      {/* 관심 식물 */}
      <InterestFlowerSection flowers={INTEREST_FLOWERS} />

      {/* 내 기록 */}
      <MyRecordSection records={MY_FEEDS} />

      {/* 저장한 스팟 */}
      <SavedSpotSection spots={SAVED_SPOTS} />

      <Nav activeTab="my" />
    </div>
  )
}
