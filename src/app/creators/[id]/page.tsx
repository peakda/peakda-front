'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import Button from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'

const MOCK_CREATOR_DETAIL = {
  hostBadge: '피크다 PICK',
  title: '이맘때 가장\n눈이 부신 여행지',
  subtitle: '노란 물결이 가장 예쁜 순간, 놓치지 마세요',
  heroImage: '/images/explore.png',
  spots: [
    {
      order: 1,
      name: '고창 학원농장',
      seasonLabel: '절정',
      seasonVariant: 'bloom' as const,
      image: '/images/explore.png',
      body: '너른 들판을 가득 채운 해바라기가 절정을 맞이했어요. 지금 방문하면 가장 눈부신 풍경을 만날 수 있어요.',
      spotId: 1,
    },
    {
      order: 2,
      name: '태안 청산수목원',
      seasonLabel: '이제 막',
      seasonVariant: 'green' as const,
      image: '/images/explore.png',
      body: '이제 막 피어나기 시작한 해바라기밭. 한적하게 둘러보기 좋은 시기예요.',
      spotId: 2,
    },
    {
      order: 3,
      name: '영월 요선정',
      seasonLabel: '막바지',
      seasonVariant: 'secondary' as const,
      image: '/images/explore.png',
      body: '해질 무렵 노을과 함께 보는 해바라기밭. 막바지 물결도 놓치기 아쉬워요.',
      spotId: 3,
    },
  ],
}

export default function CreatorDetailPage() {
  const router = useRouter()
  const creator = MOCK_CREATOR_DETAIL

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      {/* 히어로 이미지 */}
      <div className="relative h-[411px] w-full">
        <Header left={<LeftArrow />} />
        <Image src={creator.heroImage} alt={creator.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-2 p-4">
          <Badge label={creator.hostBadge} variant="filled" color="white" className="w-fit" />
          <h1 className="text-xl leading-tight font-bold whitespace-pre-line text-white">
            {creator.title}
          </h1>
          <p className="text-sm text-white/80">{creator.subtitle}</p>
        </div>
      </div>

      {/* 에디토리얼 구분선 */}
      <div className="border-border-primary bg-bg-secondary h-2 border-y" />

      {/* Spot 리스트 */}
      <div className="flex flex-col gap-8 px-4 py-6">
        {creator.spots.map((spot) => (
          <div key={spot.order} className="flex flex-col gap-3">
            {/* 컨텐츠 헤더 */}
            <div className="flex items-center gap-2">
              <span className="bg-brand-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {spot.order}
              </span>
              <h2 className="text-text-primary text-lg font-extrabold">{spot.name}</h2>
            </div>

            {/* 사진 카드 */}
            <div className="relative h-45 w-full overflow-hidden rounded-2xl">
              <Image src={spot.image} alt={spot.name} fill className="object-cover" />
              <CardBadge
                label={spot.seasonLabel}
                variant={spot.seasonVariant}
                className="absolute top-2 left-2"
              />
            </div>

            {/* 본문 텍스트 */}
            <p className="text-text-secondary text-sm leading-[1.5]">{spot.body}</p>

            {/* 지도에서 보기 */}
            <button
              type="button"
              className="text-text-secondary flex w-fit items-center gap-1 text-sm"
              onClick={() => router.push(`/spot/${spot.spotId}`)}
            >
              <MapPin className="h-3.5 w-3.5" />
              지도에서 보기
            </button>
          </div>
        ))}
      </div>

      {/* 하단 CTA → 큐레이션 지도 뷰 (라우트 미정) */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="flex-1"
          onClick={() => router.push('/map')}
        >
          큐레이션 지도 보기
        </Button>
      </div>
    </div>
  )
}
