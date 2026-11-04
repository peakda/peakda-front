'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

const RECORDS = [
  {
    id: 'spring',
    tab: '봄 · 벚꽃',
    image: '/images/landing/record-spring-musimcheon.webp',
    alt: '청주 무심천의 벚꽃 풍경 예시',
    location: '청주 무심천 · 봄 기록 예시',
    description:
      '벚꽃이 활짝 핀 봄 풍경이에요. 최근 방문 사진을 보고 꽃이 얼마나 피었는지 확인해 보세요.',
  },
  {
    id: 'summer',
    tab: '여름 · 녹음',
    image: '/images/landing/spot-jangtaesan.webp',
    alt: '장태산자연휴양림의 푸른 숲 풍경 예시',
    location: '장태산자연휴양림 · 녹음 기록 예시',
    description:
      '나무가 푸르게 우거진 숲 풍경이에요. 다녀온 사람들이 남긴 사진에서 계절의 모습을 살펴보세요.',
  },
  {
    id: 'autumn',
    tab: '가을 · 단풍',
    image: '/images/landing/record-naejangsan.webp',
    alt: '단풍으로 물든 내장산 케이블카 주변의 가을 풍경',
    location: '내장산 케이블카 · 가을 기록 예시',
    description:
      '붉고 노랗게 물든 내장산의 가을 풍경이에요. 방문 날짜와 사진을 함께 보고 언제 갈지 정해 보세요.',
  },
]

const AUTUMN_INDEX = 2

// Scene 01 기록 카드의 계절 탭. 사진 세 장을 겹쳐 두고 선택한 것만 보이게 해 바뀔 때 겹쳐 지나간다.
export const SeasonRecord = () => {
  const [selected, setSelected] = useState(AUTUMN_INDEX)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const record = RECORDS[selected]

  // 탭 목록 키보드 규칙: 좌우 화살표로 옆 탭, Home·End 로 처음·끝
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = RECORDS.length - 1
    const next =
      e.key === 'ArrowRight'
        ? (index + 1) % RECORDS.length
        : e.key === 'ArrowLeft'
          ? (index + last) % RECORDS.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setSelected(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="계절별 기록 예시"
        className="bg-landing-tab flex gap-1 rounded-[13px] p-1"
      >
        {RECORDS.map((item, index) => {
          const isSelected = index === selected
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              id={`record-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="record-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'flex-1 cursor-pointer rounded-xl p-1.5 text-center text-[11px] leading-[1.6] tracking-[-0.02em] whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 md:text-[13px]',
                isSelected
                  ? 'bg-white font-bold text-green-600 shadow-[0_2px_8px_#263e1610]'
                  : 'text-landing-tab-text hover:text-green-600'
              )}
            >
              {item.tab}
            </button>
          )
        })}
      </div>

      <div
        id="record-panel"
        role="tabpanel"
        aria-labelledby={`record-tab-${record.id}`}
        className="flex flex-col gap-5"
      >
        <div className="relative h-55 overflow-hidden rounded-3xl md:h-75">
          {RECORDS.map((item, index) => (
            <Image
              key={item.id}
              src={item.image}
              alt={index === selected ? item.alt : ''}
              aria-hidden={index !== selected}
              fill
              sizes="(min-width: 1280px) 660px, (min-width: 768px) 698px, 306px"
              className={cn(
                'object-cover motion-safe:transition-[opacity,scale] motion-safe:duration-500 motion-safe:ease-out',
                index === selected ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'
              )}
            />
          ))}
        </div>
        <p
          key={`${record.id}-location`}
          className="motion-safe:animate-in motion-safe:fade-in-0 text-[13px] leading-[1.45] font-bold tracking-[-0.02em] text-green-600 motion-safe:duration-300"
        >
          {record.location}
        </p>
        <h3 className="text-landing-ink text-xl leading-[1.45] font-bold tracking-[-0.02em] md:text-[26px]">
          다녀온 날은 이런 모습이었어요
        </h3>
        <p
          key={`${record.id}-description`}
          className="text-landing-muted motion-safe:animate-in motion-safe:fade-in-0 text-[13px] leading-[1.7] motion-safe:duration-300 md:text-[15px]"
        >
          {record.description}
        </p>
      </div>
    </>
  )
}
