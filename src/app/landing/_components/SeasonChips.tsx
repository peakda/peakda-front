'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SITE_URL } from '@/constants/site'
import { cn } from '@/lib/utils/cn'

// 아이콘이 없는 메밀꽃·은행나무는 시안대로 글자만 둔다
const SEASON_CHIPS = [
  { label: '벚꽃', icon: '/flowers/cherry-blossom.webp', color: 'bg-[#FFA8B4]/20 text-[#FFA8B4]' },
  { label: '철쭉', icon: '/flowers/royal-azalea.webp', color: 'bg-[#E82A78]/20 text-[#E82A78]' },
  { label: '진달래', icon: '/flowers/azalea.webp', color: 'bg-[#FF6FA0]/20 text-[#FF6FA0]' },
  { label: '유채꽃', icon: '/flowers/canola.webp', color: 'bg-[#FFE87A]/20 text-[#FFE87A]' },
  { label: '매화', icon: '/flowers/plum.webp', color: 'bg-[#FF7F92]/20 text-[#FF7F92]' },
  { label: '산수유', icon: '/flowers/forsythia.webp', color: 'bg-[#FFD63A]/20 text-[#FFD63A]' },
  { label: '수국', icon: '/flowers/hydrangea.webp', color: 'bg-[#97CAFF]/20 text-[#97CAFF]' },
  { label: '연꽃', icon: '/flowers/lotus.webp', color: 'bg-[#FFCFD6]/20 text-[#FFCFD6]' },
  { label: '해바라기', icon: '/flowers/sunflower.webp', color: 'bg-[#FFB800]/20 text-[#FFB800]' },
  { label: '메밀꽃', icon: null, color: 'bg-[#A0B884]/20 text-[#A0B884]' },
  { label: '단풍', icon: '/flowers/maple.webp', color: 'bg-[#F0603A]/20 text-[#F0603A]' },
  { label: '은행나무', icon: null, color: 'bg-[#E0A800]/20 text-[#E0A800]' },
  { label: '억새', icon: '/flowers/SilverGrass.webp', color: 'bg-[#C2AA8A]/20 text-[#C2AA8A]' },
  { label: '코스모스', icon: '/flowers/cosmos.webp', color: 'bg-[#F07088]/20 text-[#F07088]' },
  { label: '동백꽃', icon: '/flowers/camellia.webp', color: 'bg-[#C8202A]/20 text-[#C8202A]' },
]

// 칩이 왼쪽부터 차례로 떠오르게 하는 지연(Tailwind 가 읽을 수 있게 클래스를 그대로 적는다)
const CHIP_DELAYS = [
  'delay-0',
  'delay-40',
  'delay-80',
  'delay-120',
  'delay-160',
  'delay-200',
  'delay-240',
  'delay-280',
  'delay-320',
  'delay-360',
  'delay-400',
  'delay-440',
  'delay-480',
  'delay-520',
  'delay-560',
]

// Scene 02 계절 칩. 하나만 고를 수 있고(다시 누르면 해제), 고른 꽃에 맞춰 아래 문구와 링크 글자가 바뀐다.
export const SeasonChips = () => {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {SEASON_CHIPS.map((chip, index) => {
          const isSelected = chip.label === selected
          return (
            <li key={chip.label} className={cn('reveal-item', CHIP_DELAYS[index])}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : chip.label)}
                className={cn(
                  'flex cursor-pointer items-center gap-[2.33px] rounded-full border px-[7px] py-[4.67px] transition-[translate,border-color,box-shadow] duration-200 hover:-translate-y-0.5',
                  chip.color,
                  isSelected
                    ? '-translate-y-0.5 border-current shadow-[0_3px_10px_#0000000b]'
                    : 'border-transparent'
                )}
              >
                {chip.icon && (
                  <Image src={chip.icon} alt="" width={19} height={19} className="size-[18.67px]" />
                )}
                <span className="text-[12.83px] leading-normal font-semibold tracking-[-0.02em] md:font-bold">
                  {chip.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col gap-2">
        <hr className="border-gray-200" />
        <p
          aria-live="polite"
          className="text-landing-muted text-sm leading-[1.6] tracking-[-0.02em]"
        >
          {selected
            ? `${selected} 명소가 궁금하다면, 피크다에서 찾아보세요.`
            : '어떤 풍경이 보고 싶으세요?'}
        </p>
        <a
          href={`${SITE_URL}/map`}
          className="hover:text-landing-ink w-fit text-sm leading-[1.6] font-bold tracking-[-0.02em] text-green-600 transition-colors duration-200"
        >
          {selected ? `${selected} 명소 찾아보기 →` : '피크다에서 명소 찾기 →'}
        </a>
      </div>
    </>
  )
}
