'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/app/landing/_components/Reveal'
import { SITE_URL } from '@/constants/site'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  {
    label: '01 마음에 드는 곳 찜하기',
    hint: '명소 화면에서 하트를 눌러요.',
    eyebrow: '이번 주, 어디가 좋을까요?',
    lead: '준비중·피기시작·만개,',
    highlight: '세 단계로 바로 확인해요',
    image: '/images/landing/phone-save.webp',
    alt: '피크다 명소 상세 화면 — 하트를 눌러 찜하고 올해 만개 시기를 확인한다',
    caption: '명소 상세 화면에서 하트를 눌러 찜해두세요.',
  },
  {
    label: '02 만개 알림 켜기',
    hint: '찜한 명소의 만개 소식을 받아요.',
    eyebrow: '찜만 해둬도, 놓치지 않아요',
    lead: '만개 예상 시기,',
    highlight: '미리 알려드릴게요',
    image: '/images/landing/phone-alert.webp',
    alt: '찜 목록 추가 안내와 만개 7일 전 푸시 알림 설정 화면',
    caption: '찜한 명소의 만개 알림을 켤 수 있어요.',
  },
]

// 데스크톱(xl)에서만 섹션을 길게 두고 내용을 고정해 스크롤로 단계를 넘긴다.
// 모바일·태블릿은 내용이 한 화면보다 길어 고정할 수 없어 단계를 눌러서만 바꾼다.
const DESKTOP_QUERY = '(min-width: 1280px)'
// 섹션이 화면을 꽉 채운 동안 스크롤한 비율(0~1). 단계 카드의 진행 막대(globals.css 의
// view-timeline 'contain' 구간)와 같은 기준이라, 01 막대가 다 차는 순간 02 로 넘어간다.
const getProgress = (rect: DOMRect) => {
  const scrollable = rect.height - window.innerHeight
  return scrollable > 0 ? -rect.top / scrollable : 0
}

// Scene 03 찜·만개 알림. 단계에 맞춰 휴대폰 카드가 스크롤 방향으로 밀려나며 바뀐다.
export const SavedSteps = () => {
  const trackRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  // 스크롤 위치 → 단계. 절반을 넘으면 02 로 넘어간다.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    let frame = 0
    const update = () => {
      frame = 0
      if (!desktop.matches || !trackRef.current) return
      setActive(getProgress(trackRef.current.getBoundingClientRect()) >= 0.5 ? 1 : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    update()
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // 데스크톱에서는 그 단계가 보이는 스크롤 위치(각 구간의 가운데)로 이동하고, 나머지는 바로 바꾼다.
  const select = (index: number) => {
    setActive(index)
    const track = trackRef.current
    if (!track || !window.matchMedia(DESKTOP_QUERY).matches) return
    const rect = track.getBoundingClientRect()
    const scrollable = rect.height - window.innerHeight
    // html 의 scroll-behavior(동작 줄이기 설정이 아니면 smooth)를 따른다
    window.scrollTo({ top: window.scrollY + rect.top + scrollable * (index === 0 ? 0.25 : 0.75) })
  }

  return (
    <section
      ref={trackRef}
      className="landing-steps bg-landing-sage px-5 py-12 md:px-8 md:py-20 xl:h-[220vh] xl:px-30 xl:py-0"
    >
      <div className="xl:sticky xl:top-[77px] xl:flex xl:h-[calc(100dvh-77px)] xl:items-center">
        <Reveal className="mx-auto flex w-full max-w-300 flex-col gap-8 xl:flex-row xl:items-center xl:gap-20">
          <div className="reveal-item flex flex-col gap-4 xl:flex-1">
            <p className="text-xs leading-[1.55] font-bold text-green-600">
              03 마음에 드는 곳을 놓치지 않게
            </p>
            <h2 className="text-landing-ink text-3xl leading-[1.55] font-bold md:text-[40px]">
              가고 싶은 곳은 찜.
              <br />
              만개 소식은 알림으로.
            </h2>
            <p className="text-landing-muted text-[15px] leading-[1.55] md:text-[17px]">
              가보고 싶은 곳을 찾았다면 하트를 눌러두세요.
              <br />
              찜한 곳은 모아보고, 만개 알림도 받을 수 있어요.
            </p>
            <ol className="flex flex-col gap-4">
              {STEPS.map((step, index) => (
                <li key={step.label}>
                  <button
                    type="button"
                    aria-pressed={index === active}
                    onClick={() => select(index)}
                    className={cn(
                      'flex w-full cursor-pointer flex-col gap-1 rounded-3xl border px-5 py-4 text-left transition-[background-color,border-color,box-shadow,translate] duration-200 hover:translate-x-[3px]',
                      index === active
                        ? 'border-green-300 bg-white shadow-[0_5px_16px_#263e1608]'
                        : 'border-landing-line'
                    )}
                  >
                    <span className="text-landing-ink text-base leading-[1.55] font-bold">
                      {step.label}
                    </span>
                    <span className="text-landing-muted text-[13px] leading-[1.55]">
                      {step.hint}
                    </span>
                    {/* 데스크톱 스크롤 진행 막대 — 채우는 건 globals.css(.landing-step-bar) */}
                    <span
                      aria-hidden
                      className="landing-step-track bg-landing-line mt-2 h-0.5 rounded-full"
                    >
                      <span
                        data-step={index}
                        className="landing-step-bar h-full rounded-full bg-green-300"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <a
              href={`${SITE_URL}/map`}
              className="hover:text-landing-ink w-fit border-b border-[#b6c8aa] pb-1 text-sm leading-[1.55] font-bold text-green-600 transition-colors duration-200 hover:border-current"
            >
              찜하고 싶은 명소 찾아보기 ↗
            </a>
          </div>

          <figure className="reveal-item flex flex-col items-center gap-4 delay-150 xl:flex-1">
            <div className="@container relative aspect-[9/16] w-70 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,rgba(255,240,242,0.4)_55.4%,rgba(213,236,192,0.4)_100%)] md:w-80">
              {STEPS.map((step, index) => (
                <div
                  key={step.label}
                  aria-hidden={index !== active}
                  className={cn(
                    'absolute inset-0 motion-safe:transition-[opacity,translate] motion-safe:duration-500 motion-safe:ease-out',
                    // 지나간 단계는 위로, 다음 단계는 아래에서 — 스크롤 방향과 같게 움직인다
                    index === active
                      ? 'opacity-100'
                      : index < active
                        ? '-translate-y-6 opacity-0'
                        : 'translate-y-6 opacity-0'
                  )}
                >
                  {/* 예전 슬라이드 카드(540×960)와 같은 비율 배치 — 글자·여백은 카드 너비(cqw) 기준 */}
                  <div className="px-[7.407cqw] pt-[5.926cqw]">
                    <p className="text-[4.444cqw] leading-[1.4] tracking-[-0.02em] text-green-400">
                      {step.eyebrow}
                    </p>
                    <p className="mt-[1.481cqw] text-[7.037cqw] leading-[1.35] tracking-[-0.02em] text-green-800">
                      {step.lead}
                      <br />
                      <strong className="font-bold">{step.highlight}</strong>
                    </p>
                  </div>
                  <Image
                    src={step.image}
                    alt={index === active ? step.alt : ''}
                    width={543}
                    height={1098}
                    sizes="(min-width: 768px) 215px, 188px"
                    className="absolute top-[20.417%] left-[16.48%] h-auto w-[67.04%]"
                  />
                </div>
              ))}
            </div>
            <figcaption className="text-landing-muted grid text-center text-xs leading-[1.55]">
              {STEPS.map((step, index) => (
                <span
                  key={step.label}
                  aria-hidden={index !== active}
                  className={cn(
                    '[grid-area:1/1] motion-safe:transition-opacity motion-safe:duration-500',
                    index === active ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {step.caption}
                </span>
              ))}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
