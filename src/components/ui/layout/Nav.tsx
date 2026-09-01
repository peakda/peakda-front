import { Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface NavProps {
  activeTab: 'map' | 'explore' | 'feed' | 'my' | 'none'
}

export function Nav({ activeTab }: NavProps) {
  const itemClass = 'flex cursor-pointer flex-col items-center gap-1 justify-center'
  return (
    <div className="border-border shadow-background fixed right-0 bottom-0 left-0 z-10 mx-auto min-h-20 max-w-[430px] border bg-white px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex justify-around text-sm">
        {/* 지도 */}
        <Link href="/map" className={itemClass} aria-current={activeTab === 'map' ? 'page' : undefined}>
          <Image
            src={'/icons/explore.svg'}
            alt="지도"
            width={20}
            height={20}
            className={activeTab === 'map' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'map' ? 'text-black' : 'text-gray-400'}>지도</p>
        </Link>

        {/* 추천 */}
        <Link
          href="/explore"
          className={itemClass}
          aria-current={activeTab === 'explore' ? 'page' : undefined}
        >
          <Image
            src={'/icons/mapSearch.svg'}
            alt="탐색"
            width={20}
            height={20}
            className={activeTab === 'explore' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'explore' ? 'text-black' : 'text-gray-400'}>탐색</p>
        </Link>

        {/* 플러스 버튼 (중앙) */}
        <Link
          href="/record"
          aria-label="기록 작성"
          className="bg-brand-secondary mt-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full"
        >
          <Plus size={20} className="text-white" />
        </Link>

        {/* 피드 */}
        <Link href="/feed" className={itemClass} aria-current={activeTab === 'feed' ? 'page' : undefined}>
          <Image
            src={'/icons/feed.svg'}
            alt="피드"
            width={20}
            height={20}
            className={activeTab === 'feed' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'feed' ? 'text-black' : 'text-gray-400'}>피드</p>
        </Link>

        {/* My */}
        <Link href="/my" className={itemClass} aria-current={activeTab === 'my' ? 'page' : undefined}>
          <div
            className={`rounded-full bg-gray-200 p-1 ${activeTab === 'my' ? 'opacity-100' : 'opacity-50'}`}
          >
            <Image src={'/icons/my.svg'} alt="My" width={18} height={18} />
          </div>
          <p className={activeTab === 'my' ? 'text-black' : 'text-gray-400'}>My</p>
        </Link>
      </div>
    </div>
  )
}
