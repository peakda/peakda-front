import { Bell } from 'lucide-react'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import SpotCard from '@/components/ui/card/SpotCard'
import { SPOTProps } from '@/app/search/_components/SpotPanel'
import { SavedSpotEmpty } from '@/app/my/_components/SavedSpotEmpty'

const SAVED_SPOTS: SPOTProps[] = [
  {
    id: 1,
    name: '장소',
    location: '경상남도 창원시 진해구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
  {
    id: 2,
    name: '장소',
    location: '경상남도 창원시 진해구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
  {
    id: 3,
    name: '장소',
    location: '경상남도 창원시 진해구',
    status: '이제 막요',
    nameList: ['벚꽃'],
  },
]

export default function SavedSpotsPage() {
  const spots = SAVED_SPOTS

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={
            <div className="text-[15px] font-medium text-[#000000]">찜한 스팟({spots.length})</div>
          }
        />
      </div>

      {spots.length === 0 ? (
        <SavedSpotEmpty />
      ) : (
        <>
          {/* 만개 임박 안내 배너 */}
          <div className="px-4 py-2">
            <div className="bg-green-50 text-brand-secondary flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium">
              <Bell className="h-4 w-4 shrink-0" />
              <span>진해 군항제가 곧 1주일전이에요 · 3.28(토) ~ 4.5(일)</span>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {spots.map((spot) => (
              <SpotCard spot={spot} key={spot.id} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
