import Image from 'next/image'
import { Reveal } from '@/app/landing/_components/Reveal'
import { StageTimeline } from '@/app/landing/_components/StageTimeline'

// 히어로의 곡교천 풍경 + '얼마나 물들었을까?' 기록 카드.
// 화면에 들어오면 사진이 살짝 줌아웃되고, 카드가 올라온 뒤 트랙이 차오르고 핀이 '절정'에 떨어진다.
// 사진은 스크롤에 따라 최대 42px 천천히 내려오는 패럴랙스(.landing-parallax)라 위아래로 42px 씩 크게 둔다.
export const HeroVisual = () => (
  <Reveal className="rounded-5xl relative aspect-[350/380] w-full overflow-hidden md:aspect-auto md:h-120 xl:max-w-235">
    <div className="landing-parallax absolute inset-x-0 top-0 h-full min-[541px]:-top-[42px] min-[541px]:h-[calc(100%+84px)]">
      <Image
        src="/images/landing/hero-gokgyocheon.webp"
        alt="노랗게 물든 아산 곡교천 은행나무길"
        fill
        priority
        sizes="(min-width: 1280px) 940px, (min-width: 768px) 754px, 100vw"
        className="object-cover motion-safe:scale-[1.06] motion-safe:transition-transform motion-safe:duration-[1600ms] motion-safe:ease-out motion-safe:group-data-shown/reveal:scale-100"
      />
    </div>

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
