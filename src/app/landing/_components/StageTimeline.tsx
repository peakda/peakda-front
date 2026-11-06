'use client'

import { useState } from 'react'
import { Pin } from '@/components/Map/Pin'
import type { Stage } from '@/constants/map'
import { cn } from '@/lib/utils/cn'

// 위치는 트랙(304px) 기준 비율이라 모바일 274px 에서도 같은 배치가 된다.
// segment 는 선택 단계 둘레의 진한 구간(62px)으로, 양 끝 단계에서는 트랙 밖으로 안 나가게 붙인다.
const STAGES: {
  stage: Stage
  label: string
  position: string
  segment: string
  color: string
  ring: string
  activeLabel: string
}[] = [
  {
    stage: 'Before',
    label: '시즌 전',
    position: 'left-[5%]',
    segment: 'left-0',
    color: 'bg-gray-400',
    ring: 'border-gray-400',
    activeLabel: 'text-[#697484]',
  },
  {
    stage: 'Early',
    label: '이르다',
    position: 'left-[27.5%]',
    segment: 'left-[calc(27.5%-31px)]',
    color: 'bg-green-300',
    ring: 'border-green-300',
    activeLabel: 'text-[#507834]',
  },
  {
    stage: 'Start',
    label: '피기 시작',
    position: 'left-1/2',
    segment: 'left-[calc(50%-31px)]',
    color: 'bg-pink-200',
    ring: 'border-pink-200',
    activeLabel: 'text-[#b8536c]',
  },
  {
    stage: 'Peak',
    label: '절정',
    position: 'left-[72.5%]',
    segment: 'left-[calc(72.5%-31px)]',
    color: 'bg-pink-400',
    ring: 'border-pink-400',
    activeLabel: 'text-pink-600',
  },
  {
    stage: 'End',
    label: '늦었다',
    position: 'left-[95%]',
    segment: 'left-[calc(100%-62px)]',
    color: 'bg-pink-600',
    ring: 'border-pink-600',
    activeLabel: 'text-[#a41729]',
  },
]

const PEAK_INDEX = 3
const PIN_FLOWERS = [{ src: '/images/landing/pin-ginkgo.webp' }]

// 히어로 기록 카드의 단계 타임라인. 단계를 누르면 지도에서 쓰는 피크다 핀이 그 단계로 옮겨 가고
// 핀 테두리도 단계 색으로 바뀐다. 처음 보일 때의 트랙 채움·핀 낙하는 HeroVisual 의 Reveal 이 건다.
export const StageTimeline = () => {
  const [selected, setSelected] = useState(PEAK_INDEX)
  // 처음엔 낙하 연출만, 사용자가 단계를 바꾼 뒤부터 이동할 때마다 핀이 한 번 튀어 오른다
  const [hasMoved, setHasMoved] = useState(false)
  const active = STAGES[selected]

  const select = (index: number) => {
    if (index === selected) return
    setSelected(index)
    setHasMoved(true)
  }

  return (
    <div className="relative h-[85px] md:h-23">
      <div className="absolute inset-x-0 top-[50px] h-2 origin-left rounded-full bg-[linear-gradient(90deg,#A8B0BC_0%,#8DC468_25%,#FFA8B4_50%,#F7576B_75%,#C41F33_100%)] opacity-55 motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:delay-500 motion-safe:duration-700 motion-safe:group-data-shown/reveal:scale-x-100" />
      <div
        className={cn(
          'absolute top-[50px] h-2 w-[62px] rounded-full motion-safe:transition-[left,background-color] motion-safe:duration-300',
          active.segment,
          active.color
        )}
      />

      <div
        className={cn(
          'absolute -top-[5px] z-10 -translate-x-1/2 motion-safe:transition-[left] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0.7,0.2,1)]',
          active.position
        )}
      >
        <div className="motion-safe:group-data-shown/reveal:animate-pin-drop motion-safe:opacity-0">
          <div key={selected} className={cn(hasMoved && 'motion-safe:animate-bounce-smooth')}>
            <Pin flowers={PIN_FLOWERS} maxStage={active.stage} />
          </div>
        </div>
      </div>

      {STAGES.map((stage, index) => {
        const isSelected = index === selected
        return (
          <button
            key={stage.stage}
            type="button"
            aria-pressed={isSelected}
            onClick={() => select(index)}
            className={cn(
              'group/stage absolute top-9 h-[50px] w-14 -translate-x-1/2 cursor-pointer',
              stage.position
            )}
          >
            <span
              className={cn(
                'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:transition-all motion-safe:duration-300',
                isSelected
                  ? cn('top-3.5 size-4 border-4 bg-white', stage.ring)
                  : cn('top-[18px] size-3 border-2 border-white', stage.color)
              )}
            />
            <span
              className={cn(
                'absolute left-1/2 -translate-x-1/2 whitespace-nowrap motion-safe:transition-all motion-safe:duration-300',
                isSelected
                  ? cn('top-[33px] text-[13px] font-bold tracking-[-0.02em]', stage.activeLabel)
                  : 'top-[31px] text-[11px] font-medium text-gray-500 group-hover/stage:text-gray-700'
              )}
            >
              {stage.label}
            </span>
          </button>
        )
      })}

      <p className="sr-only" aria-live="polite">
        절정도 표시 예시: {active.label}
      </p>
    </div>
  )
}
