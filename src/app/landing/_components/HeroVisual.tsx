import Image from 'next/image'
import { Reveal } from '@/app/landing/_components/Reveal'
import { cn } from '@/lib/utils/cn'

// 타임라인 다섯 단계. 위치는 트랙(304px) 기준 비율이라 모바일 274px 에서도 같은 배치가 된다.
const STAGES = [
  { label: '시즌 전', position: 'left-[5%]', dot: 'bg-gray-400' },
  { label: '이르다', position: 'left-[27.5%]', dot: 'bg-green-300' },
  { label: '피기 시작', position: 'left-1/2', dot: 'bg-pink-200' },
  { label: '늦었다', position: 'left-[95%]', dot: 'bg-pink-600' },
]

// 히어로의 곡교천 풍경 + '얼마나 물들었을까?' 기록 카드.
// 화면에 들어오면 사진이 살짝 줌아웃되고, 카드가 올라온 뒤 트랙이 차오르고 은행잎 핀이 '절정'에 떨어진다.
export const HeroVisual = () => (
  <Reveal className="rounded-5xl relative aspect-[350/380] w-full overflow-hidden md:aspect-auto md:h-120 xl:max-w-235">
    <Image
      src="/images/landing/hero-gokgyocheon.webp"
      alt="노랗게 물든 아산 곡교천 은행나무길"
      fill
      priority
      sizes="(min-width: 1280px) 940px, (min-width: 768px) 754px, 100vw"
      className="object-cover motion-safe:scale-[1.06] motion-safe:transition-transform motion-safe:duration-[1600ms] motion-safe:ease-out motion-safe:group-data-shown/reveal:scale-100"
    />

    <div className="absolute top-6 left-6 flex flex-col gap-1 text-left text-white md:top-9 md:left-9">
      <p className="text-sm leading-[1.45] font-bold tracking-[-0.02em] md:text-base">
        충남 아산 · 곡교천 은행나무길
      </p>
      <p className="text-xs leading-[1.45] tracking-[-0.02em]">계절 풍경 예시</p>
    </div>

    <div className="reveal-item absolute inset-x-5 bottom-5 flex flex-col gap-3 rounded-4xl bg-white/96 p-[18px] text-left backdrop-blur-[4px] delay-200 md:inset-x-auto md:bottom-7 md:left-7 md:w-88 md:gap-3.5 md:p-6">
      <div className="flex flex-col gap-1 md:gap-1.5">
        <p className="text-[13px] leading-[1.45] font-bold tracking-[-0.02em] text-green-600">
          다녀온 사람들이 전하는 현장 모습
        </p>
        <p className="text-landing-ink text-2xl leading-[1.45] font-bold tracking-[-0.02em] md:text-[26px]">
          얼마나 물들었을까?
        </p>
      </div>
      <StageTimeline />
    </div>
  </Reveal>
)

const StageTimeline = () => (
  <div className="relative h-[85px] md:h-23">
    <div className="absolute inset-x-0 top-[50px] h-2 origin-left rounded-full bg-[linear-gradient(90deg,#A8B0BC_0%,#8DC468_25%,#FFA8B4_50%,#F7576B_75%,#C41F33_100%)] opacity-55 motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:delay-500 motion-safe:duration-700 motion-safe:group-data-shown/reveal:scale-x-100" />
    <div className="absolute top-[50px] left-[calc(72.5%-31px)] h-2 w-[62px] rounded-full bg-pink-400" />

    {STAGES.map((stage) => (
      <div key={stage.label} className={cn('absolute top-0 h-full', stage.position)}>
        <span
          className={cn(
            'absolute top-12 left-0 size-3 -translate-x-1/2 rounded-full border-2 border-white',
            stage.dot
          )}
        />
        <span className="absolute top-[67px] left-0 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap text-gray-500">
          {stage.label}
        </span>
      </div>
    ))}

    {/* 절정: 핀 + 큰 점 + 퍼지는 고리 */}
    <div className="absolute top-0 left-[72.5%] h-full">
      <div className="motion-safe:group-data-shown/reveal:animate-pin-drop absolute top-0 left-0 flex -translate-x-1/2 flex-col items-center motion-safe:opacity-0">
        <span className="flex size-9 items-center justify-center rounded-full border-[1.6px] border-pink-400 bg-white/60 shadow-[0_0_8px_rgba(0,0,0,0.13)] backdrop-blur-[4px]">
          <Image src="/images/landing/pin-ginkgo.webp" alt="" width={24} height={24} />
        </span>
        <svg viewBox="0 0 10 8" aria-hidden className="-mt-px h-2 w-2.5 fill-pink-400">
          <path d="M5 8 0 0h10z" />
        </svg>
      </div>
      <span className="motion-safe:group-data-shown/reveal:animate-peak-pulse absolute top-[46px] left-0 size-4 -translate-x-1/2 rounded-full bg-pink-400 opacity-0" />
      <span className="absolute top-[46px] left-0 size-4 -translate-x-1/2 rounded-full border-4 border-pink-400 bg-white" />
      <span className="absolute top-[72px] left-0 -translate-x-1/2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap text-pink-600">
        절정
      </span>
    </div>
  </div>
)
