'use client'

import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import { SITE_URL } from '@/constants/site'
import { cn } from '@/lib/utils/cn'

interface SpotPick {
  tag: string
  name: string
  region: string
  reason: string
  description: string
  image: string
  href: string
  cta: string
}

// 시안의 가을 추천 3곳을 그대로 고정한다. 상세 링크는 운영 데이터의 축제·명소 ID 다.
const SPOT_PICKS: SpotPick[] = [
  {
    tag: '꽃구경',
    name: '부여국화축제',
    region: '충남 부여군',
    reason: '색색의 국화 작품을 천천히 둘러보고 싶을 때',
    description:
      '색색의 국화 작품을 둘러볼 수 있는 가을 축제예요. 일정과 장소, 주요 볼거리를 확인해 보세요.',
    image: '/images/landing/spot-buyeo.webp',
    href: `${SITE_URL}/festivals/748`,
    cta: '축제 상세 보기 ↗',
  },
  {
    tag: '강변 산책',
    name: '곡교천 은행나무길',
    region: '충남 아산시',
    reason: '노란 은행나무를 따라 강변을 걷고 싶을 때',
    description:
      '강변을 따라 이어지는 은행나무길. 노랗게 물든 풍경을 만나고 싶다면 최근 방문 기록을 먼저 확인해 보세요.',
    image: '/images/landing/hero-gokgyocheon.webp',
    href: `${SITE_URL}/spot/11198`,
    cta: '명소 상세 보기 ↗',
  },
  {
    tag: '숲길',
    name: '장태산자연휴양림',
    region: '대전 서구',
    reason: '높게 뻗은 메타세쿼이아 사이에서 쉬고 싶을 때',
    description:
      '나무 사이를 걸으며 계절을 느낄 수 있는 곳. 같은 길도 언제 가느냐에 따라 다른 풍경을 만날 수 있어요.',
    image: '/images/landing/spot-jangtaesan.webp',
    href: `${SITE_URL}/spot/251`,
    cta: '명소 상세 보기 ↗',
  },
]

const CARD_DELAYS = ['delay-0', 'delay-100', 'delay-200']

// 카드를 누르면 시안(Added interactions)의 상세 팝업을 띄운다.
// 모바일·태블릿은 가로 스크롤, 데스크톱은 3열.
export const SpotPicks = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<SpotPick | null>(null)

  // 내용을 먼저 그린 뒤 연다. 네이티브 dialog 라 Esc 닫기·포커스 가두기·닫은 뒤 카드로 포커스 복귀를 브라우저가 맡는다.
  const open = (pick: SpotPick) => {
    flushSync(() => setSelected(pick))
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  return (
    <>
      <ul className="no-scrollbar -mx-5 -my-2 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pt-2 pb-8 md:-mx-8 md:scroll-px-8 md:px-8 xl:mx-0 xl:grid xl:grid-cols-3 xl:gap-6 xl:overflow-visible xl:px-0 xl:pb-2">
        {SPOT_PICKS.map((pick, index) => (
          <li
            key={pick.name}
            className={cn('reveal-item w-61.5 shrink-0 snap-start xl:w-auto', CARD_DELAYS[index])}
          >
            <button
              type="button"
              onClick={() => open(pick)}
              className="group flex w-full cursor-pointer flex-col gap-2.5 text-left"
            >
              <span className="flex flex-col gap-3.5 xl:gap-[21px]">
                <span className="relative block h-45 overflow-hidden rounded-3xl shadow-[0_14px_32px_rgba(23,62,53,0.16)] xl:h-[272px]">
                  <Image
                    src={pick.image}
                    alt={`${pick.name} 풍경`}
                    fill
                    sizes="(min-width: 1280px) 384px, 246px"
                    className="object-cover group-hover:scale-[1.055] motion-safe:transition-transform motion-safe:duration-650 motion-safe:ease-[cubic-bezier(0.2,0.75,0.2,1)]"
                  />
                  <span className="absolute inset-x-2 top-2 flex items-center justify-between xl:inset-x-3 xl:top-3">
                    <span className="flex h-5 items-center rounded bg-gray-950/80 px-1.5 text-xs leading-[1.4] font-bold tracking-[0.01em] text-gray-50 xl:h-7.5 xl:rounded-md xl:px-[9px] xl:text-lg">
                      상세 보기
                    </span>
                    <span className="flex h-6 items-center rounded-full bg-pink-400 px-2.5 text-xs leading-[1.4] tracking-[0.01em] text-gray-50 xl:h-9 xl:px-4 xl:text-lg">
                      {pick.tag}
                    </span>
                  </span>
                  {/* 데스크톱은 hover·포커스 때 아래에서 올라오고, 터치 화면 폭(모바일·태블릿)은 늘 보인다 */}
                  <span
                    aria-hidden
                    className="absolute right-3.5 bottom-3.5 grid size-8 place-items-center rounded-full bg-white text-xl text-green-600 motion-safe:transition-transform motion-safe:duration-300 xl:size-10 xl:translate-y-[55px] xl:text-2xl xl:group-hover:translate-y-0 xl:group-focus-visible:translate-y-0"
                  >
                    ↗
                  </span>
                </span>
                <span className="flex flex-col gap-0.5 px-1 xl:gap-[3px] xl:px-1.5">
                  <span className="text-base leading-normal font-bold tracking-[-0.02em] text-gray-950 xl:text-2xl">
                    {pick.name}
                  </span>
                  <span className="text-sm leading-normal tracking-[-0.02em] text-gray-700 xl:text-[21px]">
                    {pick.region}
                  </span>
                </span>
              </span>
              <span className="text-landing-muted text-xs leading-[1.55] xl:text-[15px]">
                {pick.reason}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* 바깥(backdrop)을 누르면 dialog 자신이 클릭 대상이 되므로 그때만 닫는다 */}
      <dialog
        ref={dialogRef}
        aria-labelledby="spot-pick-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="open:animate-in open:fade-in-0 open:zoom-in-95 rounded-5xl m-auto max-h-[90dvh] w-[calc(100%-40px)] max-w-87.5 overflow-auto border-0 bg-white p-0 shadow-[0_20px_80px_#0004] backdrop:bg-[#17201199] backdrop:backdrop-blur-[6px] open:duration-200 md:max-w-155"
      >
        {selected && (
          <>
            <div className="relative h-[230px] md:h-75">
              <Image
                src={selected.image}
                alt={`${selected.name} 풍경`}
                fill
                sizes="(min-width: 768px) 620px, 350px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="닫기"
                autoFocus
                onClick={close}
                className="text-landing-ink absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-[28px] leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 p-[22px] md:p-7">
              <p className="text-[13px] leading-[1.6] font-bold tracking-[-0.02em] text-green-600">
                {selected.region}
              </p>
              <h3
                id="spot-pick-title"
                className="text-landing-ink text-2xl leading-[1.6] font-bold tracking-[-0.02em] md:text-3xl"
              >
                {selected.name}
              </h3>
              <p className="text-landing-muted text-[15px] leading-[1.6] tracking-[-0.02em] md:text-[17px]">
                {selected.description}
              </p>
              <a
                href={selected.href}
                className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 text-sm leading-[1.4] font-medium text-white transition-colors duration-200 hover:bg-green-700 md:h-13 md:w-77.5 md:text-base"
              >
                {selected.cta}
              </a>
            </div>
          </>
        )}
      </dialog>
    </>
  )
}
