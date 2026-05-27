'use client'

import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface NavProps {
  activeTab: 'map' | 'explore' | 'feed' | 'my' | 'none'
}

export default function Nav({ activeTab }: NavProps) {
  const itemClass = 'flex cursor-pointer flex-col items-center gap-1 justify-center'
  const router = useRouter()
  return (
    <div className="border-border shadow-background fixed right-0 bottom-0 left-0 z-10 mx-auto h-20 max-w-[430px] border bg-white px-4 py-2">
      <div className="flex justify-around text-sm">
        {/* 지도 */}
        <div className={itemClass} onClick={() => router.push('/map')}>
          <Image
            src={'./icons/explore.svg'}
            alt="지도"
            width={20}
            height={20}
            className={activeTab === 'map' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'map' ? 'text-black' : 'text-gray-400'}>지도</p>
        </div>

        {/* 추천 */}
        <div className={itemClass} onClick={() => router.push('/explore')}>
          <Image
            src={'./icons/mapSearch.svg'}
            alt="탐색"
            width={20}
            height={20}
            className={activeTab === 'explore' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'explore' ? 'text-black' : 'text-gray-400'}>탐색</p>
        </div>

        {/* 플러스 버튼 (중앙) */}
        <div className="bg-brand-secondary mt-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full">
          <Plus size={20} className="text-white" />
        </div>

        {/* 피드 */}
        <div className={itemClass}>
          <Image
            src={'./icons/feed.svg'}
            alt="피드"
            width={20}
            height={20}
            className={activeTab === 'feed' ? 'opacity-100' : 'opacity-50'}
          />
          <p className={activeTab === 'feed' ? 'text-black' : 'text-gray-400'}>피드</p>
        </div>

        {/* My */}
        <div className={itemClass}>
          <div
            className={`rounded-full bg-gray-200 p-1 ${activeTab === 'my' ? 'opacity-100' : 'opacity-50'}`}
          >
            <Image src={'./icons/my.svg'} alt="My" width={18} height={18} />
          </div>
          <p className={activeTab === 'my' ? 'text-black' : 'text-gray-400'}>My</p>
        </div>
      </div>
    </div>
  )
}
