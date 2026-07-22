'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, Ticket } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Button } from '@/components/ui/button/Button'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Carousel, CarouselItem } from '@/components/ui/display/Carousel'
import { ExplorCard, ExplorCardProps } from '@/components/ui/card/ExplorCard'

const MOCK_FESTIVAL_DETAIL = {
  image: '/images/explore.png',
  statusLabel: '진행중',
  dDayLabel: 'D-30',
  title: '해바라기 축제',
  location: '전북 고창군',
  intro:
    '너른 들판을 가득 채운 해바라기가 절정을 앞두고 있어요. 여름 한복판, 노란 물결을 만나보세요.',
  period: '7월 19일 ~ 9월 13일',
  place: '전북 고창군 아산면 학원농장길 158-6',
  fee: '무료 (성인/청소년/어린이 공통)',
  hours: '09:00 ~ 18:00 (매일 운영)',
  programs: ['포토존 인증 코스', '공연 · 체험 프로그램', '노을 뷰포인트'],
  notice: [
    '대중교통 이용을 권장해요. 주차 공간이 협소해 혼잡할 수 있어요.',
    '차량 이용 시 인근 공영주차장을 이용해 주세요.',
  ],
  contact: '지역 관광 안내소 · 063-000-0000',
  nearby: [
    {
      type: 'festival',
      image: '/images/explore.png',
      name: '남해 금산 봄맞이 축제',
      description: '전남 남해군',
      dateRange: '4.1 ~ 4.14',
      status: '진행중',
    },
  ] satisfies Extract<ExplorCardProps, { type: 'festival' }>[],
}

export default function FestivalDetailPage() {
  const router = useRouter()
  const festival = MOCK_FESTIVAL_DETAIL

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      {/* 히어로 이미지 */}
      <div className="relative h-64 w-full">
        <Header left={<LeftArrow />} />
        <Image src={festival.image} alt={festival.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
          <CardBadge label={festival.statusLabel} variant="bloom" />
          <CardBadge label={festival.dDayLabel} variant="dark" />
        </div>

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-1 p-4">
          <h1 className="text-xl font-bold text-white">{festival.title}</h1>
          <span className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {festival.location}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* 소개 텍스트 */}
        <p className="text-text-secondary text-sm leading-[1.5]">{festival.intro}</p>

        {/* 기간 / 장소 / 요금 / 시간 */}
        <div className="flex flex-col gap-3">
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="기간" value={festival.period} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="장소" value={festival.place} />
          <InfoRow icon={<Ticket className="h-4 w-4" />} label="요금" value={festival.fee} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="시간" value={festival.hours} />
        </div>
      </div>

      {/* 근처 명소 */}
      <div className="border-border-primary border-t px-4 pt-4">
        <h2 className="text-text-primary mb-3 text-base font-semibold">근처 명소</h2>
        <Carousel align="start" dragFree>
          {festival.nearby.map((card) => (
            <CarouselItem key={card.name} size="auto" className="mr-3 last:mr-0">
              <ExplorCard {...card} />
            </CarouselItem>
          ))}
        </Carousel>
      </div>

      {/* 주요 프로그램 */}
      <div className="flex flex-col gap-2 px-4 py-4">
        <h2 className="text-text-primary text-base font-semibold">주요 프로그램</h2>
        <ul className="flex flex-col gap-1.5">
          {festival.programs.map((program) => (
            <li key={program} className="text-text-secondary flex items-center gap-2 text-sm">
              <span className="bg-text-tertiary h-1 w-1 shrink-0 rounded-full" />
              {program}
            </li>
          ))}
        </ul>
      </div>

      {/* 유의사항 */}
      <div className="px-4 py-4">
        <h2 className="text-text-primary mb-2 text-base font-semibold">유의사항</h2>
        <div className="bg-bg-secondary flex flex-col gap-1 rounded-xl p-3">
          {festival.notice.map((line) => (
            <p key={line} className="text-text-tertiary text-xs leading-[1.5]">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 문의처 */}
      <div className="flex flex-col gap-2 px-4 py-4">
        <h2 className="text-text-primary text-base font-semibold">문의처</h2>
        <span className="text-text-secondary flex items-center gap-1.5 text-sm">
          <Phone className="h-4 w-4 shrink-0" />
          {festival.contact}
        </span>
      </div>

      {/* 하단 CTA */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="flex-1"
          onClick={() => router.push('/map')}
        >
          지도에서 보기
        </Button>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-tertiary mt-0.5 shrink-0">{icon}</span>
      <span className="text-text-tertiary w-10 shrink-0 text-sm">{label}</span>
      <span className="text-text-primary flex-1 text-sm leading-[1.5]">{value}</span>
    </div>
  )
}
